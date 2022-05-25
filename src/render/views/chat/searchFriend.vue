<template>
  <el-dialog custom-class="searchDialog" :visible="visible" @close="visible=false" :show-close="false" width="900px">
    <div style="display: flex;">
      <div style="width: 450px;height: 100%;border:0;background-color: #F7F7F7">
        <div @keyup.enter="searchUser">
          <el-input v-model="key" type="text" placeholder="🔍搜索"
                    style="padding: 30px 40px;width: 370px;height: 40px;"></el-input>
          <p>联系人</p>
          <ul style="margin: 20px;list-style-type: none;">
            <li v-for="(item,i) in users" :key="i">
              <Linkman :active="false" :name="item.nickName" :avatar="item.avatar" :email="item.emailName"
                       :newMsgCount="0"
              ></Linkman>
            </li>
          </ul>
        </div>
      </div>
      <div style="width: 450px;height: 100%;border:0;background-color: white;"></div>
    </div>
  </el-dialog>
</template>

<script>
import {findUserByPhoneOrEmail} from "@/api/user"
import Linkman from "views/chat/linkman"

export default {
  name: "searchFriend",
  components: {Linkman},
  data() {
    return {
      visible: false,
      key: '',
      users: [],
      userSelect: ''
    }
  },
  methods: {
    searchUser() {
      findUserByPhoneOrEmail({
        findInfo: this.key
      }).then(res => {
        this.users = res.data.list
      })
    }
  }
}
</script>
<style lang="scss">
.searchDialog {
  .el-dialog__header {
    height: 0;
    padding: 0;
  }

  .el-dialog__body {
    padding: 0;
  }
}
</style>
<style scoped lang="scss">

</style>
