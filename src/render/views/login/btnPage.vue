<template>
  <div style="display: flex;flex-direction:column;align-items:center;">
    <!--头像-->
    <el-avatar shape="square" :src="avatar" :size="97" fit="fit" style="margin-top:12px;">
      {{ nameAvatar }}
    </el-avatar>
    <el-button type="primary"
               style="width:240px;height:40px;background:#4F77E1 ;font-size: 16px;margin-top: 56px;"
               v-show="step===1"
               @click="login"
    >登录
    </el-button>
    <el-button type="text"
               style="color:#4F77E1;font-size: 16px;line-height: 22px;"
               @click="changeAccount"
               v-show="step===1"
    >切换账号
    </el-button>
    <div style="font-size: 14px;color: #333333;line-height: 20px;" v-show="step===1">使用司空APP扫码登录</div>

    <div style="font-size: 16px;line-height: 22px;margin-top: 40px" v-show="step===2">
      请在手机端确认登录
    </div>
    <el-button type="text"
               style="margin-top: 127px;color: #4F77E1;"
               @click="cancelLogin"
               v-show="step===2"
    >取消登录
    </el-button>
  </div>
</template>

<script>
import {mapActions, mapGetters} from "vuex"

export default {
  name: "btnPage",
  data() {
    return {
      step: 1,
    }
  },
  computed: {
    ...mapGetters(["token", "ksId", "ks", 'userInfo', 'avatar', 'nameAvatar']),
  },
  methods: {
    ...mapActions(['FedLogOut', 'changeAccount']),
    login() {
      this.step = 2
    },
    cancelLogin() {
      this.step = 1
    }
  }
}
</script>

<style scoped>

</style>
