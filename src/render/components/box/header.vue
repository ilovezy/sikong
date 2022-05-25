<template>
  <div class="header-box">
    <div class="logo-box">
      <img src="@/assets/images/box/logo.png" height="35px" />
      
    </div>
    <div class="screen-btn">
      <Titlebtn type="min" />
      <Titlebtn type="max" />
      <Titlebtn type="close" />
    </div>
    <div class="nav-box">
      <div class="nav-left">
        <div class="left-item" @click="$emit('encry')">
          <img src="@/assets/images/box/encry.png" height="30px" />
          <div>加密</div>
        </div>
        <div class="left-item" @click="$emit('decry')">
          <img src="@/assets/images/box/decry.png" height="30px" />
          <div>解密</div>
        </div>
        <div class="left-item" @click="$emit('perm')">
          <img src="@/assets/images/box/permision.png" height="30px" />
          <div>权限</div>
        </div>
        <div class="left-item" @click="$emit('contact')">
          <img src="@/assets/images/box/contact.png" height="30px" />
          <div>好友</div>
        </div>
        <div class="left-item" @click="$emit('about')">
          <img src="@/assets/images/box/about.png" height="30px" />
          <div>关于</div>
        </div>
      </div>
      <div class="nav-right">
        <img src="@/assets/images/box/avatar.png" height="40px" />
        <div class="name">你好，{{ userInfo.phone }}</div>
        <div class="logout" @click="logout">
          <i class="mc-tuichu" style="margin-right:8px;"></i>退出
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Titlebtn from './TitleBtn'
import { mapGetters } from 'vuex'
import { ipcRenderer } from 'electron'
export default {
  components: { Titlebtn },
  data () {
    return {
      paths: []
    }
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  methods: {
    logout () {
      localStorage.clear()
      this.$router.push('/')

      ipcRenderer.send('reluncher')
    }
  },
  mounted () {}
}
</script>

<style scoped>
.header-box {
  padding: 12px 20px;
  background-color: #f0f3f6;
  border-bottom: solid 1px #c1c7d0;
  position: relative;
  -webkit-app-region: drag;
}
.logo-box {
  font-family: SourceHanSansCN-Regular;
  font-size: 24px;
  line-height: 24px;
  letter-spacing: 1px;
  color: #405994;
  display: flex;
  align-items: center;
  /* justify-content: center; */
}
.logo-box img {
  margin-right: 10px;
}
.screen-btn {
  height: 15px;
  position: absolute;
  cursor: pointer;
  right: 20px;
  top: 10px;
}
.nav-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: MicrosoftYaHei;
  font-size: 14px;
  line-height: 1;
  color: #333333;
}
.nav-left {
  display: flex;
  align-items: center;
  -webkit-app-region: no-drag;
}
.left-item {
  text-align: center;
  margin-right: 40px;
  cursor: pointer;
}
.left-item img {
  margin-bottom: 10px;
}
.nav-right {
  text-align: right;
  font-family: MicrosoftYaHei-Bold;
  font-size: 16px;
  line-height: 1;
  color: #445c96;
}
.nav-right .name {
  font-weight: 600;
  margin: 10px 0;
}
.logout {
  cursor: pointer;
  font-size: 14px;
  -webkit-app-region: no-drag;
}
</style>
