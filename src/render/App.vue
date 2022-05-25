<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import {ipcRenderer} from "electron"
import {app} from "@electron/remote"
import {mapActions, mapGetters} from "vuex"
import {db} from "@/plugins/db"
import {decrypted, encrypted} from "utils/encrypt"
import {requireKdByFileId} from '@/api/mail'
import moment from "moment"

const m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export default {
  name: 'app',
  data() {
    return {
      receiveMailTask: null,
      friendTask: null
    }
  },
  computed: {
    ...mapGetters(['lastDate', 'ksId', 'ks', 'email', 'userInfo', 'friendList', 'phone'])
  },
  mounted() {
    this.listenReceiveMailBk()
    this.listenExit()
    setTimeout(this.receiveMailIfOK, 5000)
    this.receiveMailTask = setInterval(this.receiveMailIfOK, 30000)
    this.friendTask = setInterval(this.getFriend, 30000)
  },
  beforeDestroy() {
    this.clearTask()
    // 避免每次刷新页面，重复注册收信事件
    ipcRenderer.removeAllListeners('receiveMailBk')
  },
  methods: {
    ...mapActions(['setEmail', 'setLastDate', 'FedLogOut', 'getFriendList', 'getFriendApplyList', 'addOrUpdateNearContactList']),
    clearTask() {
      this.receiveMailTask && clearInterval(this.receiveMailTask)
      this.friendTask && clearInterval(this.friendTask)
    },
    receiveMailIfOK() {
      if (!this.phone) {
        console.log('未登录跳过收信')
        return
      }
      if (!this.email || !this.email.emailName || !this.email.emailPassword) {
        console.log('无有效邮箱配置跳过收信')
        return
      }
      moment.locale('en');
      const dateStr = moment(this.lastDate).format('MMM DD, YYYY')
      console.log('查看收件箱')
      ipcRenderer.send('receiveMail', [{
        boxName: 'INBOX',
        msgFlag: 'ALL',
        readOnly: true,
        dateStr,
        conf: this.email
      }, {
        boxName: this.getSentMessagesName(),
        msgFlag: 'ALL',
        readOnly: true,
        dateStr,
        conf: this.email
      }])
    },
    getSentMessagesName() {
      const url = this.email.imapReceiver
      if (url === 'imap.163.com' || url === 'imap.126.com') {
        return 'Sent Messages'
      } else if (url === 'imap.exmail.qq.com' || url === 'imap.qq.com') {
        return 'Sent Messages'
      }
      return 'Sent'
    },
    listenReceiveMailBk() {
      const that = this
      ipcRenderer.on('receiveMailBk', async (event, args) => {
        console.log(args)
        if (args.code !== 1) {
          this.$message.error({
            message: '收取邮件失败：' + args.msg,
            center: true
          })
          return
        }
        const mail = await this.parseMails(that, args.data)
        if (mail) {
          console.log(`邮件新增1条`)
          await db.mails.put(mail)
        }
        // 数据库更新成功，再更新邮件查询时间
        const lastDate = new Date()
        console.log('更新截止日期为:', lastDate)
        that.setLastDate(lastDate);
      })
    },
    async parseMails(that, mail) {
      mail.userId = this.userInfo.id
      const res = await db.mails.get({
        id: mail.id,
        userId: mail.userId
      })
      if (res && res.decrypted === 1) {
        console.log('已存在，跳过')
        return null
      }
      if (mail.code in [1, 2, 4]) {
        // 标记未读
        mail.read = 0
      }
      mail.userId = this.userInfo.id
      mail.decrypted = 1
      if (mail.kdId && mail.code !== 1) {
        try {
          const result = await requireKdByFileId({
            fileId: mail.kdId,
            askType: mail.code in [2, 4] ? 0 : 1
          })
          const text = decrypted(mail.text, result.data.kd)
          console.log(`邮件解密成功! text: ${mail.text}`)
          // 保存解密后信息
          mail.text = text
        } catch (err) {
          console.error(`邮件解密失败：${err}，text: ${mail.text}`)
          mail.decrypted = 0
        }
      }
      let friend = null
      if (mail.to === this.userInfo.emailName) {
        mail.toUserId = this.userInfo.id
        if (this.friendList && this.friendList.length > 0) {
          let index = this.friendList.findIndex(friend => friend.email === mail.from)
          if (index > -1) {
            friend = this.friendList[index]
            mail.fromUserId = this.friendList[index].id
            console.log('未读+1')
            this.addOrUpdateNearContactList({
              userId: friend.id,
              name: friend.nickAfter ? friend.nickAfter : friend.nickName,
              email: friend.email,
              avatar: friend.userImg,
            })
          }
        }
      } else if (mail.from === this.userInfo.emailName) {
        mail.fromUserId = this.userInfo.id
        if (this.friendList && this.friendList.length > 0) {
          let index = this.friendList.findIndex(friend => friend.email === mail.to)
          if (index > -1) {
            friend = this.friendList[index]
            mail.toUserId = this.friendList[index].id
          }
        }
      }
      return mail
    },
    listenExit() {
      ipcRenderer.on('renderExit', async (event, args) => {
        await this.FedLogOut()
        app.exit(0)
      })
    },
    getFriend() {
      if (!this.phone) {
        console.log('未登录跳过通讯录同步')
        return
      }
      console.log('通讯录同步')
      this.getFriendApplyList()
      this.getFriendList()
    },
  }
}
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
}

html, body, #app, section {
  height: 100%;
}


/*定义滚动条高宽及背景 高宽分别对应横竖滚动条的尺寸*/
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  //background-color: #F5F5F5;
}

/*定义滚动条轨道 内阴影+圆角*/
::-webkit-scrollbar-track {
  border-radius: 4px;
  background-color: #F5F5F5;
  //box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  //-webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}

/*定义滑块 内阴影+圆角*/
::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: #c8c8c8;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, .1);
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .1);
}
</style>
