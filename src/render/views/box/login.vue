<template>
  <div class="login-container">
    <div id="mytitle" style="height:50px;position:relative;z-index:999999">
      <Titlebtn type="close" />
    </div>
    <div class="card-box login-form">
      <h3 class="title">登录无忧密存</h3>
      <div style="text-align:center;height: 220px;width:100%;" v-if="!loginShow">
        <!-- :logoSrc="config.imagePath" -->
        <vue-qr :bgSrc="config.imagePath" :text="qrcode" :colorDark="config.BYTE_POS" :size="220"></vue-qr>
      </div>
      <div style="text-align:center;height: 160px;width:100%;" v-if="loginShow">
        <img :src="loginImg" alt v-if="token" style="width:100px;height:100px;margin:auto;" />
        <p v-if="token" class="phone">{{ loginData.phone }}</p>
      </div>
      <div
        v-if="loginShow"
        style="margin-bottom:20px;-webkit-app-region: no-drag;text-align:center;"
      >
        <el-button
          type="primary"
          style="width:100%;cursor:pointer;height:36px;"
          :loading="loading"
          @click.native.prevent="noticeLogin"
        >登录</el-button>
        <el-button
          type="text"
          style="cursor:pointer;height:36px;margin-top:10px;"
          @click.native.prevent="reLogin"
        >切换账号</el-button>
      </div>
      <div class="tips" v-if="loginShow">使用手机无忧密存APP确认登录</div>
      <div class="tips" v-if="!loginShow">使用手机无忧密存APP扫码登录</div>
    </div>
  </div>
</template>
<script>
import {
  enOrDecryptedApi,
  checkLoginApi,
  getLoginParaApi,
  checkStateApi,
  noticeLoginApi
} from '@/api/box'
import VueQr from 'vue-qr'
import { mapGetters } from 'vuex'
import Titlebtn from '@/components/box/TitleBtn'
import { genID } from '@/utils'
import {ipcRenderer} from 'electron'
export default {
  components: { VueQr, Titlebtn },
  name: 'login',
  data () {
    return {
      config: { value: '无忧密存登录', BYTE_POS: '#333' },
      loginData: {},
      qrcode: '',
      ks0: '',
      /* ks: localStorage.getItem('s_key'),
        ksId: localStorage.getItem('ksId'),
        userInfo: null,
        token: localStorage.getItem('Admin-Token'), */
      loginImg: require('@/assets/images/box/avatar.png'),
      loading: false,
      timeOut: null,
      showDialog: false,
      loginTimer: null, // 登录轮询定时器
      params: {}, // 登录参数
      loginShow: false, // 是否显示登录按钮
      content: '', // 已有数据情况下加密后的请求参数
      timeStamp: ''
    }
  },
  computed: {
    ...mapGetters(['token', 'userInfo', 'ksId', 'ks'])
  },
  methods: {
    // 处理用户信息，跳转主页面
    async afterQRScan (secData) {
      let ks = this.loginShow ? this.userInfo.ks0 : this.ks0
      let res = await enOrDecryptedApi({
        decrypted: 1,
        content: secData,
        ks: ks
      })
      if (!res || !res.data || !res.data.status) {
        this.getQrcode()
        return
      }
      let result = res.data
      console.log('decryptedText:', result.data)
      if (result && result.data) {
        let resData = JSON.parse(result.data)
        this.loginData = resData.storeUser
        let ksId = this.loginData.keyId
        if (resData.ksId) {
          ksId = resData.ksId
        }
        let content = JSON.stringify({ phone: this.loginData.phone })
        let { data } = await enOrDecryptedApi({
          decrypted: 0,
          content: content,
          ks: resData.ks
        })
        console.log('login-res:', this.loginData)
        this.loginData.content = data.data
        this.loginData.token = this.params.token
        this.loginData.mac = this.params.mac
        if (this.ks0) {
          this.loginData.ks0 = this.ks0
        } else {
          this.loginData.ks0 = this.userInfo.ks0
        }
        this.$store.dispatch('LoginByEmail', this.loginData)
        this.$store.dispatch('setKsid', { ksId: ksId, ks: resData.ks })

        ipcRenderer.send('openMainWindow')
        // this.$router.push("/home");
      }
    },
    // 点击登录
    async noticeLogin () {
      this.loading = true
      let postData = {
        ksId: this.ksId,
        content: this.content
      }
      await noticeLoginApi(postData)
      this.params.token = this.userInfo.token
      this.params.mac = this.userInfo.pcMac
      // this.test()
      this.checkLogin()
    },
    // 检测登录
    async checkLogin () {
      let _this = this
      clearTimeout(_this.timeOut)
      _this.timeOut = null
      let postData = { ...this.params, appType: 1 }
      this.loginTimer = setInterval(() => {
        checkLoginApi(postData).then((res) => {
          if (res && res.status === 200) {
            if (res.data.code === '00') {
              // console.log("res:",res)
              if (res.data.data) {
                // 登录成功
                clearInterval(_this.loginTimer)
                this.loginTimer = null
                this.afterQRScan(res.data.data)
              }
            }
          }
        })
      }, 5000)
      this.timeOut = setTimeout(() => {
        if (_this.loginTimer) {
          clearInterval(_this.loginTimer)
          _this.loginTimer = null
          if (_this.loginShow) {
            _this.loading = false
            this.message('登录超时，请重新登录！')
          } else {
            this.message('请求超时，请重新扫描！')
            _this.getQrcode()
          }
        }
      }, 120000)
    },
    message (msg, type) {
      this.$message({ message: msg, type: type })
    },
    // 切换账号
    reLogin () {
      let _this = this
      clearInterval(_this.loginTimer)
      this.loginTimer = null
      this.loginShow = false
      this.$store.dispatch('loginOut')
      this.getLoginData()
    },
    // 生成二维码数据
    getQrcode () {
      this.ks0 = genID()
      this.params.timeStamp = new Date().valueOf()
      let content = {
        ks0: this.ks0,
        mac: this.params.mac,
        timeStamp: this.params.timeStamp
      }
      this.qrcode = JSON.stringify(content)
      console.log(this.qrcode)
      this.checkLogin()
    },
    // 获取登录数据
    async getLoginData () {
      let { data } = await getLoginParaApi()
      if (data.status) {
        this.params = data.data
        this.getQrcode()
      }
    },
    async fetchData () {
      let timeStamp = new Date().valueOf()
      let contentObj = {
        appType: 1,
        mac: this.userInfo.pcMac,
        phone: this.userInfo.phone,
        ks0: this.userInfo.ks0,
        timeStamp: timeStamp
      }
      let { data } = await enOrDecryptedApi({
        decrypted: 0,
        content: JSON.stringify(contentObj),
        ks: this.ks
      })
      this.content = data.data
      console.log('userInfo:', this.userInfo)
      let postData = {
        ksId: this.ksId,
        content: this.content
      }
      let res = await checkStateApi(postData)
      if (res && res.data && res.data.code === '00') {
        this.loginShow = true
        this.params.timeStamp = timeStamp
      } else {
        this.reLogin()
      }
    }
  },
  mounted () {
    if (this.token) {
      // this.userInfo = JSON.parse(localStorage.getItem('Admin-userInfo'))
      this.fetchData()
    } else {
      this.getLoginData()
    }
    // this.$router.push('/home')
  }
}
</script>


<style scoped>
.tips {
  font-size: 16px;
  color: #1a1e24;
  margin-top: 20px;
  text-align: center;
}
.login-container {
  height: 100vh;
  background-color: #fff;
  position: relative;
  -webkit-app-region: drag;
}
.login-container .titlebtn {
  position: absolute;
  width: 20px;
  height: 20px;
  right: 10px!important;
  top: 0;
  bottom: 0;
  margin: auto 0;
  -webkit-app-region: no-drag; 
}
.login-container .titlebtn i{
  font-size: 20px;
}
input:-webkit-autofill {
  -webkit-text-fill-color: #fff !important;
}
  .title {
    font-size: 18px;
    color: #50607d;
    margin: 0px auto 10px;
    text-align: center;
    font-weight: bold;
  }
  .phone {
    text-align: center;
    font-weight: bold;
    color: #333333;
    font-size: 18px;
  }
  .login-form {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    /* width: 250px; */
    padding: 20px 35px 20px;
    margin: 0 auto;
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }

.login-container .titlebtn {
    position: absolute;
    width: 20px;
    height: 20px;
    right: 10px !important;
    top: 0;
    bottom: 0;
    margin: auto 0;
    -webkit-app-region: no-drag;
  }
  .login-container .titlebtn i{
      color: #333;
      font-size: 20px;
    }
</style>