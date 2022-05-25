<template>
  <div>
    <div style="height:60px;width:100%;-webkit-app-region: drag;position:relative;">
      <i class="el-icon-close" @click="exit"
         style="-webkit-app-region: no-drag;position:absolute; top:20px;right:20px;font-size: 20px;"></i>
    </div>
    <qr-page @authLogin="login" v-if="!userInfo"/>
    <btn-page @loginSuccess="login" v-else/>
  </div>
</template>

<script>
import {mapGetters, mapActions} from "vuex";
import {app} from "@electron/remote"
import qrPage from "views/login/qrPage"
import btnPage from "views/login/btnPage"
import {checkLogin} from "@/api/login"

export default {
  name: "loginView",
  components: {
    qrPage,
    btnPage
  },
  data() {
    return {

    }
  },
  computed: {
    ...mapGetters(["token", "ks", "userInfo", 'name','mac']),
  },
  mounted() {

  },
  methods: {
    ...mapActions(['Login']),
    exit() {
      app.exit(0)
    },
    login() {
      checkLogin({
        token: this.token,
        mac: this.mac
      }).then(res => {
        this.Login(res.data)
        this.$router.replace("/home")
      }).catch(e => {
        console.log('登录失败：' + e)
        this.$message.error({message: '登录失败！', center: true})
      });
    }
  }
}
</script>

<style scoped>

</style>
