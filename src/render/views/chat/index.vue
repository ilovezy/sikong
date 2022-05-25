<template>
  <el-container>
    <el-aside width="380px">
      <el-container>
        <el-header class="window-header">
          <search-bar @openSearchUserWindow="searchUserWindow"/>
        </el-header>
        <el-main>
          <ul style="margin: 20px;list-style-type: none;">
            <li v-for="(item,i) in nearContactList" :key="i" @click="selectLinkman(item)">
              <Linkman :active="selectedUser.userId===item.userId"
                       :name="item.name" :avatar="item.avatar" :email="item.email" :newMsgCount="item.newMsgCount"
              ></Linkman>
            </li>
          </ul>
        </el-main>
      </el-container>
    </el-aside>
    <el-main>
      <el-empty v-show="selectedUser.userId==null" :image-size="256" :image="emptyImage" description=" "></el-empty>
      <el-container v-show="selectedUser.userId!=null">
        <el-header class="window-header">
          <p class="title">{{ selectedUser.name }}</p>
        </el-header>
        <el-main>
          <chat-box :user="selectedUser"/>
        </el-main>
      </el-container>
    </el-main>

      <search-friend ref="searchFriend"/>

  </el-container>
</template>

<script>
import SearchFriend from "views/chat/searchFriend"
import SearchBar from "views/chat/searchBar"
import Linkman from "views/chat/linkman"
import chatBox from "views/chat/chatBox"
import {mapActions, mapGetters} from "vuex"

export default {
  name: "chartView",
  components: {SearchFriend, SearchBar, Linkman, chatBox},
  computed: {
    ...mapGetters(['nearContactList'])
  },
  data() {
    return {
      emptyImage: require('assets/images/logo/logo_256.png'),
      selectedUser: {},
      searchVisible: false,
    }
  },
  mounted() {
    // this.initTmpContactList()
    console.log(`chat index: ${this.$route.query.index}`)
    if(this.$route.query.index){
      this.selectLinkman(this.nearContactList[this.$route.query.index])
    }
  },
  methods: {
    ...mapActions(['setNearContactList']),
    initTmpContactList() {
      if (this.nearContactList != null && this.nearContactList.length > 0) {
        console.log("无需初始化临时数据")
        return
      }
      console.log("初始化临时数据")
      const arr = []
      for (let i = 0; i < 20; i++) {
        const n = 10 + i
        arr.push({
          userId: n,
          name: '王总 ' + n,
          email: '278976727@qq.com',
          avatar: require("assets/images/profile.jpg"),
          newMsgCount: Math.floor(Math.random() * 200)
        },)
      }
      this.setNearContactList(arr)
    },
    selectLinkman(user) {
      this.selectedUser = user
      const arr = this.nearContactList
      for (let one of arr) {
        if (one.userId === user.userId) {
          one.newMsgCount = 0
        }
      }
      this.setNearContactList(arr)
    },
    searchUserWindow() {
      this.$refs.searchFriend.visible = true
    },
  }
}
</script>

<style lang="scss" scoped>
.el-header {
  padding: 0 !important;
}

.el-aside {
  background-color: #F5F6F7;
}

.el-main {
  padding: 0 !important;
}

.el-empty {
  height: 100%;
}

.window-header {
  -webkit-app-region: drag;
  border-bottom: #E9E9E9 solid 1px;
}

.title {
  font-size: 20px;
  font-family: PingFangSC-Semibold, PingFang SC;
  font-weight: 600;
  color: #333333;
  line-height: 28px;
  margin: 16px 30px;;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
