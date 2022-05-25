<template>
  <div>
    <div v-show="!scanSuccess" style="display: flex;flex-direction:column;align-items:center;">
      <div style="font-size: 22px;font-weight: 600;line-height: 30px;margin-bottom: 20px;">扫一扫登录</div>
      <vue-qrcode :value="qrcode" :options="qrOpts" tag="img"></vue-qrcode>
      <div style="font-size: 14px;line-height: 20px;margin-top: 20px">请使用司空APP扫码登录</div>
    </div>
    <div v-show="scanSuccess"
         style="display: flex;flex-direction:column;align-items:center;font-size: 16px;line-height: 22px;">
      <div style="width:72px;height:72px;background-color: #4F77E1;border-radius: 8px;">
        <i class="el-icon-check" style="line-height: 72px;width: 100%;font-size: 72px;color:white;"/>
      </div>
      <div style="margin-top: 30px;color: #4F77E1;font-weight: 400;font-size: 18px;line-height: 25px;">
        扫描成功
      </div>
      <div style="margin-top: 10px;color: #333333;">
        请在手机端确认登录
      </div>
      <el-button type="text"
                 style="margin-top: 127px;color: #4F77E1;"
                 @click="loginCancel"
      >取消登录
      </el-button>
    </div>
  </div>
</template>

<script>
import {inquireLoginState, cancelLogin} from '@/api/login'
import {ipcRenderer} from "electron"
import {encrypted} from "utils/encrypt"
import {getData} from "utils/data"
import VueQrcode from '@chenfengyuan/vue-qrcode';
import {mapActions, mapGetters} from 'vuex'

export default {
  name: "qrPage",
  components: {VueQrcode},
  data() {
    return {
      scanSuccess: false,
      qrcode: '司空',
      qrOpts: {
        type: 'image/jpeg',
        quality: 0.3,
        width: 186,
        margin: 0,
        color: {
          dark: "#333",
          light: "#fff"
        }
      },
      qrLogo: require('assets/images/logo/logo_64.png'),
      checkTask: null,
      timeStamp: '',
      ks0: '',
      token: ''
    }
  },
  computed: {
    ...mapGetters(['mac'])
  },
  mounted() {
    this.ks0 = '54F0853FD5D8D2FD61CE33309B0D0273' //getData('ks0', () => genKs0())
    this.token = encrypted(this.mac, this.ks0)
    this.initUserData({
      ks0: this.ks0,
      token: this.token
    })
    this.clearTask()
    this.createQr()
    this.checkScan()
  },
  beforeDestroy() {
    this.clearTask()
  },
  methods: {
    ...mapActions(['initUserData', 'Login', 'FedLogOut']),
    createQr() {
      this.scanSuccess = false
      this.timeStamp = new Date().valueOf()
      const content = {
        ks0: this.ks0,
        mac: this.mac,
        timeStamp: this.timeStamp,
      }
      this.qrcode = JSON.stringify(content);
    },
    // 清除定时器
    clearTask() {
      console.log('清除定时器')
      this.checkTask && clearInterval(this.checkTask)
    },
    checkScan() {
      this.checkTask = setInterval(() => {
        console.log('检查扫码状态')
        inquireLoginState({
          mac: this.mac
        }).then(res => {
          console.log(res)
          if (res.data) {
            const state = res.data.userLoginStatus
            console.log(state)
            if (state === 0) {
              this.scanSuccess = false
            } else if (state === 1) {
              !this.scanSuccess && this.$message.success({message: '扫码成功！', center: true})
              this.scanSuccess = true
            } else if (state === 2) {
              console.log("授权登录")
              this.scanSuccess = true
              this.$emit("authLogin")
              return
            } else if (state === 3) {
              this.$message.info({message: '取消登录！', center: true})
              this.createQr()
            }
          }
          const dif = new Date().valueOf() - this.timeStamp
          if (dif > 1000 * 60 * 60 * 24 * 7) {
            console.log('刷新二维码时间戳')
            this.createQr()
          }
        }).catch(e => console.error(e))
      }, 5000)
    },
    loginCancel() {
      this.scanSuccess = false
      cancelLogin({mac: this.mac})
          .then(() => {
            this.createQr()
          }).catch(e => {
        console.error('取消登录失败：' + e)
      })
    },
  }
}
</script>

<style scoped>

</style>
