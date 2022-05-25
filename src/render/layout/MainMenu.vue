<template>
  <div style="height: 100%">
    <ul id="menu">
      <li class="title-btn">
        <img @click="min" src="../assets/images/layout/btn/min.png" width="16" height="16" alt/>
        <img @click="max" src="../assets/images/layout/btn/max.png" width="16" height="16" alt/>
        <img @click="close" src="../assets/images/layout/btn/close.png" width="16" height="16" alt/>
      </li>
      <li>
        <el-popover
            placement="right"
            width="360"
            trigger="click">
          <mine-card/>
          <el-avatar shape="square" :src="avatar" :size="40" slot="reference">{{ nameAvatar }}</el-avatar>
        </el-popover>
      </li>
      <li @click="changePage('/home/chat')"
          :style="{'background-image':`url(${this.path === '/'||this.path === '/home/chat' ? img.chatActive : img.chat})`}"
      ></li>
      <li @click="changePage('/home/email')"
          :style="{'background-image':`url(${this.path === '/home/email' ? img.emailActive : img.email})`}"
      ></li>
      <li @click="changePage('/home/box')"
          :style="{'background-image':`url(${this.path === '/home/box' ? img.boxActive : img.box})`}"
      ></li>
      <li @click="changePage('/home/contact')"
          :style="{'background-image':`url(${this.path === '/home/contact' ? img.contactActive : img.contact})`}"
      ></li>
      <li @click="changePage('/home/setting')"
          :style="{'background-image':`url(${this.path === '/home/setting' ? img.settingActive : img.setting})`}"
      ></li>
      <li @click="openHelpCard"
          :style="{'background-image':`url(${img.help})`,position: 'absolute',bottom:'86px'}"
      ></li>
      <li @click="logout"
          :style="{'background-image':`url(${img.logout})`,position: 'absolute',bottom:'30px'}"
      ></li>
    </ul>

    <el-dialog
        title="帮助"
        :visible.sync="helpCardShow"
        width="340px"
        center>
      <img :src="img.wxCode" alt="微信公众号" style="width: 220px;height: 220px;background: #D8D8D8;margin: 0 35px;">
      <div style="text-align: center;margin-bottom: 62px;">
        <p>查看常见问题及操作指南</p>
        <p>请扫码关注公众号</p>
        <p>(点击保存二维码打开微信扫一扫)</p>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
import {getCurrentWindow} from "@electron/remote"
import MineCard from "views/user/mineCard"

const ipcRenderer = require('electron').ipcRenderer;
export default {
  name: "MainMenu",
  components: {MineCard},
  data() {
    return {
      path: '/',
      img: {
        chat: require('assets/images/layout/menu/chat.svg'),
        chatActive: require('assets/images/layout/menu/chat_active.svg'),
        email: require('assets/images/layout/menu/email.svg'),
        emailActive: require('assets/images/layout/menu/email_active.svg'),
        box: require('assets/images/layout/menu/box.svg'),
        boxActive: require('assets/images/layout/menu/box_active.svg'),
        contact: require('assets/images/layout/menu/contact.svg'),
        contactActive: require('assets/images/layout/menu/contact_active.svg'),
        setting: require('assets/images/layout/menu/setting.svg'),
        settingActive: require('assets/images/layout/menu/setting_active.svg'),
        help: require('assets/images/layout/menu/help.svg'),
        logout: require('assets/images/layout/menu/logout.svg'),
        wxCode: require('assets/wx_code.jpg'),
      },
      helpCardShow: false,
      mineCardShow: false,
    };
  },
  computed: {
    ...mapGetters(['avatar', 'name', 'nameAvatar']),
  },
  mounted() {
  },
  methods: {
    ...mapActions(['FedLogOut']),
    min() {
      getCurrentWindow().minimize();
    },
    max() {
      if (getCurrentWindow().isMaximized()) {
        getCurrentWindow().unmaximize();
      } else {
        getCurrentWindow().maximize();
      }
    },
    close() {
      getCurrentWindow().close();
    },
    changePage(path) {
      if (this.$router.currentRoute.path === path) {
        return
      }
      this.path = path
      this.$router.replace(path);
    },
    openMineCard() {
      console.log(1234)
      this.mineCardShow = true
    },
    openHelpCard() {
      this.helpCardShow = true
    },
    async logout() {
      await this.$confirm('确定退出吗？', '退出')
      await this.FedLogOut()
      ipcRenderer.send('logout', null)
      await this.$router.replace('/login')
    }
  }
}
</script>

<style lang="scss" scoped>
#menu {
  height: 100%;
  background-color: #ffffff;
  overflow: hidden;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  -webkit-app-region: drag;

  > li {
    -webkit-app-region: no-drag;
    width: 80px;
    height: 56px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 26px;

    &:not(.title-btn):hover {
      background-color: #e8f0f8;
    }
  }

  .title-btn {
    height: 60px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    -webkit-app-region: drag;

    > img {
      //不可拖拽
      -webkit-app-region: no-drag;
    }
  }

  .el-avatar {
    display: block;
    margin: 8px auto;
  }
}

.el-dialog__body {
  padding: 60px;
}
</style>
