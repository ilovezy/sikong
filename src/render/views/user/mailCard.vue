<template>
  <div>
    <ul v-show="active<0">
      <li v-for="(server,i) in mailServers" :key="i"
          :style="{'background-image':`url(${server.img})`}"
          @click="choice(i)"></li>
    </ul>
    <el-form v-show="active>-1" ref="form" :model="form" :rules="rules" size="small">
      <el-form-item label="" prop="emailName">
        <el-input v-model="form.emailName" :disabled="saveLoading" placeholder="请输入您的邮箱账户" clearable></el-input>
      </el-form-item>
      <el-form-item label="" prop="emailPassword">
        <el-input v-model="form.emailPassword" :disabled="saveLoading" placeholder="请输入邮箱授权码"
                  type="password" clearable></el-input>
      </el-form-item>
      <el-form-item style="text-align: center">
        <a href="">内容如何获取授权码？</a>
      </el-form-item>
      <el-form-item style="text-align: center">
        <el-button @click="cancelSave" size="small">
          取消
        </el-button>
        <el-button @click="saveEmail" :loading="saveLoading" type="primary" size="small">
          {{ saveLoading ? '验证中...' : '登录' }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {ipcRenderer} from "electron"
import {mapActions, mapGetters} from "vuex"
import {updateMailInfo} from '@/api/mail'

export default {
  name: "mailCard",
  computed: {
    ...mapGetters(['userInfo']),
  },
  data() {
    return {
      mailServers: [
        {
          img: require('assets/images/email/net-buz.png'),
          server: {
            host: '',
            port: '',
            secure: true,
          }
        },
        {
          img: require('assets/images/email/ali-buz.png'),
          server: {
            host: '',
            port: ''
          }
        },
        {
          img: require('assets/images/email/tencent-buz.png'),
          server: {
            mailName: "腾讯企业邮箱",
            imapReceiver: "imap.exmail.qq.com",
            imapSslPort: 993,
            imapSslSwitch: true,
            smtpSender: "smtp.exmail.qq.com",
            smtpSslPort: 465,
            stmpSslSwitch: true,
          }
        },
        {
          img: require('assets/images/email/163.png'),
          server: {
            mailName: '163邮箱',
            imapReceiver: 'imap.163.com',
            imapSslPort: 993,
            imapSslSwitch: true,
            smtpSender: 'smtp.163.com',
            smtpSslPort: 465,
            stmpSslSwitch: true,
          }
        },
        {
          img: require('assets/images/email/126.png'),
          server: {
            host: '',
            port: ''
          }
        },
        {
          img: require('assets/images/email/qq.png'),
          server: {
            host: '',
            port: ''
          }
        },
        {
          img: require('assets/images/email/other.png'),
          server: {
            host: '',
            port: ''
          }
        },
      ],
      active: -1,
      saveLoading: false,
      form: {
        imapReceiver: '',
        imapSslPort: 993,
        imapSslSwitch: true,
        smtpSender: '',
        smtpSslPort: 465,
        stmpSslSwitch: true,
        id: this.userInfo?.id,
        emailName: '',
        emailPassword: '',
      },
      rules: {
        emailName: [
          {required: true, message: '请输入邮箱账号', trigger: 'blur'},
          {type: 'email', message: '邮箱格式有误', trigger: 'blur'}
        ],
        emailPassword: [
          {required: true, message: '请输入邮箱授权码', trigger: 'blur'},
          {min: 3, max: 30, message: '长度在 3 到 30 个字符', trigger: 'blur'}
        ],
      }
    }
  },
  mounted() {
  },
  methods: {
    ...mapActions(['setEmail']),
    choice(index) {
      if (this.active === index) {
        return
      }
      this.active = index
      const conf = this.mailServers[index].server
      this.form = Object.assign(this.form, conf, {
        emailName: '',
        emailPassword: '',
      })
    },
    saveEmail() {
      this.$refs.form.validate((valid) => {
        if (!valid) {
          return
        }
        this.saveLoading = true
        ipcRenderer.once('startMailSeverBk', (event, args) => {
          if (args.code === 1) {
            this.setEmail(args.data)
            updateMailInfo({
              phone: this.userInfo.phone,
              userInfo: this.form
            }).then(res => {
              console.log(res)
              this.$message.success('操作成功')
            }).catch(e => {
              this.$message.error('邮箱更新失败：' + e)
            })
          } else {
            this.$message.error({
              message: '邮箱错误：' + args.msg,
              center: true
            })
          }
          this.saveLoading = false
        })
        ipcRenderer.send('startMailSever', this.form)
      })
    },
    cancelSave() {
      this.active = -1
      this.saveLoading = false
      this.form = {
        imapReceiver: '',
        imapSslPort: 993,
        smtpSender: '',
        smtpSslPort: 465,
        stmpSslSwitch: true,
        id: this.userInfo.id,
        emailName: '',
        emailPassword: ''
      }
    }
  }
}
</script>
<style scoped lang="scss">
ul {
  //padding: 0 18px;
  list-style-type: none;

  li {
    width: 248px;
    height: 60px;
    background-size: 104px 24px;
    background-repeat: no-repeat;
    background-position: center;

    &:not(:last-child) {
      border-bottom: #E9E9E9 solid 1px;
    }
  }
}
</style>
