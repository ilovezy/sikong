<template>
  <div style="height: calc(100% - 232px)">
    <div class="chat-list"></div>
    <div class="chat-utils">
      <a @click="openEmojiDialog"><i class="iconfont el-icon-smiling"/></a>
      <a @click="openFileUploadDialog"><i class="iconfont el-icon-annex-full"/></a>
      <div style="float:right;height: 100%;margin-right: 30px;">
        <el-checkbox v-model="snapchat" @change="updateSnapchat">阅后即焚</el-checkbox>
        <el-checkbox v-model="encryption" :disabled="snapchat">量子密钥加密</el-checkbox>
      </div>
    </div>
    <textarea class="chat-input" v-model="msg" :disabled="sending" @keydown.ctrl.enter="sendEmail"></textarea>
  </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
import nodemailer from 'nodemailer'
import {encrypted, md5} from "utils/encrypt"
import {getMailCode} from "utils/email"

const msgHeader = `这是一封量子密钥加密邮件。请从手机应用市场或官网（http://www.qmake.com.cn）下载“司空”APP查看邮件内容。

----以下是邮件内容----

`
export default {
  name: "chatBox",
  props: ['user'],
  data() {
    return {
      snapchat: false,
      encryption: true,
      msg: '',
      sending: false,
      transporter: null,
    }
  },
  computed: {
    ...mapGetters(['email', 'ksId']),
  },
  mounted() {
  },
  methods: {
    ...mapActions(['getKd']),
    updateSnapchat(selected) {
      if (selected) {
        this.encryption = true
      }
    },
    mailCode() {
      if (this.snapchat) {
        return getMailCode(4)
      }
      if (this.encryption) {
        return getMailCode(2)
      }
      return getMailCode(1)
    },
    async sendEmail() {
      if (!this.email) {
        this.$alert('请先配置您的邮箱！', '发送失败')
        return
      }
      if (this.sending) {
        return
      }
      this.sending = true
      console.log('发送邮件')
      this.initTransporter(false)
      let text = msgHeader + this.mailCode()
      if (this.encryption) {
        const kdData = await this.getKd()
        text += kdData.fileId + encrypted(this.msg, kdData.kd)
      } else {
        text += this.msg
      }

      this.transporter.sendMail({
        from: this.email?.emailName, // sender address
        to: this.user.email, // list of receivers
        subject: "量子加密邮件", // Subject line
        text, // plain text body
        // html: "<b>Hello world?</b>", // html body
      }).then(info => {
        this.msg = ''
        this.$message.success('发送成功！')
      }).catch(e => {
        console.error(e)
        this.$message.error('发送失败！')
      }).finally(() => {
        this.sending = false
      })
    },
    initTransporter(flush) {
      if (!this.transporter || flush) {
        this.transporter = nodemailer.createTransport({
          host: this.email?.smtpSender,
          port: this.email?.smtpSslPort,
          secure: this.email?.stmpSslSwitch,
          auth: {
            user: this.email?.emailName,
            pass: this.email?.emailPassword,
          },
        })
      }
    },
    openEmojiDialog() {

    },
    openFileUploadDialog() {

    }
  }
}
</script>

<style scoped lang="scss">
.chat-list {
  height: 100%;
}

.chat-utils {
  height: 60px;
  line-height: 60px;
  border-top: 1px solid #cccccc;

  .iconfont {
    font-size: 24px;
    line-height: 60px;
    margin-left: 30px;
    cursor: pointer;
  }

  a:active {
    color: #abbef1;
  }
}

.chat-input {
  height: 120px;
  width: calc(100% - 40px);
  border: none;
  resize: none;
  padding: 0 20px 20px 20px;
  font-size: 18px;
  font-family: PingFangSC-Regular, PingFang SC;
}

.chat-input:focus {
  outline: 0;
}
</style>
