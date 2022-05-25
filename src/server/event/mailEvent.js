import {app, ipcMain} from 'electron'
import Imap from 'imap'
import {simpleParser} from 'mailparser';
import path from "path"
import {exitsFolder} from '../utils/file'
import {codeList} from '@/utils/email'

let userPath // 获取electron应用的用户目录
let imap = null

function connect(conf, readyCb, errorCb) {
  console.log('创建邮箱客户端，配置：', JSON.stringify(conf, null, 2))
  const tmp = Imap({
    user: conf.emailName,
    password: conf.emailPassword,
    host: conf.imapReceiver,
    port: conf.imapSslPort,
    tls: conf.stmpSslSwitch,
    tlsOptions: {rejectUnauthorized: false},
    connTimeout: 10000,//链接超时等待数，默认10000毫秒
    authTimeout: 10000,//身份验证的毫秒数
  })
  tmp.once('ready', () => {
    tmp.getSpecialUseBoxes(rs => {
      console.log('boxes: ', JSON.stringify(rs, null, 2))
    })
    console.log('准备完成')
    if (imap && imap.state === 'connected') {
      imap.end()
    }
    tmp.id({
      "name": "sikong",
      "version": "1.0.0",
      "vendor": "启明量子",
      "support-email": "hotcoffie@163.com"
    })
    imap = tmp
    userPath = path.join(app.getPath('userData'), 'attachment', conf.id + '')
    exitsFolder(userPath)
    readyCb && readyCb()

  })
  tmp.once('error', function (err) {
    console.log('邮箱连接异常: ' + err);
    errorCb && errorCb(err)
  });
  tmp.once('end', function () {
    console.log('邮箱断开连接');
  });
  tmp.connect()
}

ipcMain.on('startMailSever', (event, conf) => {
  connect(conf, () => event.sender.send('startMailSeverBk', {code: 1, data: conf}),
    err => event.sender.send('startMailSeverBk', {code: 0, msg: err}))
})

/**
 * @param boxName 'INBOX', 'Sent Messages', 'Drafts', 'Trash', 'Junk', 'Flagged'
 * @param msgFlag 'ALL', 'ANSWERED', 'FLAGGED', 'SEEN', 'DRAFT', 'RECENT', 'UNSEEN'
 */
ipcMain.on('receiveMail', async (event, list) => {
    for (let i = 0; i < list.length; i++) {
      const {
        boxName, readOnly, msgFlag, dateStr, conf
      } = list[i]
      console.log(`收到收件请求\n\t信箱：${boxName}\n\t时间：${dateStr}\n\t客户端：${imap ? imap.state : '未创建'}`)
      try {
        await new Promise(
          (resolve, reject) => {
            if (!imap || !['connected', 'authenticated', 'readyauthenticated'].includes(imap.state)) {
              connect(conf,
                () => openBox(event, boxName, readOnly, msgFlag, dateStr, resolve, reject),
                reject)
            } else {
              console.log('直接打开邮箱')
              openBox(event, boxName, readOnly, msgFlag, dateStr, resolve, reject)
            }
          })
      } catch (err) {
        console.log('打开', boxName, '邮箱失败：', err)
        event.sender.send('receiveMailBk', {code: 0, msg: err})
      }
    }
  }
)

function openBox(event, boxName, readOnly, msgFlag, dateStr, resolve, reject) {
  imap.openBox(boxName, readOnly, (err, box) => {
    if (err) {
      reject(`邮箱${boxName}打开失败: ${err}`)
      return
    }
    console.log(`邮箱${boxName}打开成功`)
    console.log(JSON.stringify(box, null, 2))
    receiveMail(event, msgFlag, dateStr, imap, boxName, box.messages.total, resolve, reject)
  })
}

function receiveMail(event, msgFlag, dateStr, imap, boxName, total, resolve, reject) {
  // const criteria= [msgFlag, ['OR', [`${total < 10 ? 1 : total - 10}:*`], ['SINCE', dateStr]]]
  // const criteria = [msgFlag, [`${total < 10 ? 1 : total - 10}:*`]]
  const criteria = [msgFlag, ['SINCE', dateStr]]
  console.log("开始搜索邮件 ", JSON.stringify(criteria, null, 2))
  imap.search(criteria, (err, results) => {
    if (err) {
      reject(`搜索邮件失败: ${err}`)
      return
    }
    if (!results || results.length < 1) {
      console.log('未获取到邮件')
      resolve()
      return
    }
    const mails = {}
    console.log(`搜索到${results.length}封邮件`)
    const f = imap.fetch(results, {bodies: '', struct: true});
    f.on('message', function (msg, seqno) {
      msg.on('body', function (stream, info) {
        simpleParser(stream).then(parsed => {
            let text = parsed.text
            if (parsed.html || !text) {
              // html类不属于司空邮件
              return
            }
            let code = codeList.findIndex(item => text.indexOf(item) > -1)
            if (code < 0) {
              // 无司空标识跳过
              return
            }
            const mail = {
              id: parsed.messageId,
              from: parsed.from.value[0].address,
              to: parsed.to.value[0].address,
              date: parsed.date,
              attachments: parsed.attachments,
              seqno,
              code
            }
            const secretIndex = text.indexOf(codeList[code])
            if (code === 1) { // 非加密聊天邮件
              mail.text = text.substring(secretIndex + 8).trimEnd()
            } else { // 是加密邮件
              mail.kdId = text.substring(secretIndex + 8, secretIndex + 40)
              mail.text = text.substring(secretIndex + 40).trimEnd()
            }
            event.sender.send('receiveMailBk', {code: 1, data: mail, boxName: boxName})
          }
        ).catch(e => {
          console.error('邮件解析错误：' + e)
        })
      });
    });
    f.once('error', function (err) {
      reject(`邮件读取失败: ${err}`)
    });
    f.once('end', function () {
      resolve()
    });
  });
}

export const stopMailServer = () => {
  return new Promise((resolve, reject) => {
    if (!imap) {
      console.log('未启动邮箱，退出')
      resolve()
    } else {
      imap.end();
      imap.once('error', (err) => {
        resolve(err)
      })
      console.log(imap.state)
      if (imap.state === 'connected') {
        imap.once('end', () => {
          console.log('邮箱连接断开，退出')
          imap = null
          resolve()
        })
      } else {
        console.log('未连接邮箱，退出')
        imap = null
        resolve()
      }
    }
  })
}

console.log('encryptEvent is loaded!')
