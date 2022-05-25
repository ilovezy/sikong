<template>
  <el-container class="mineContact" style="background: #F5F6F7">
    <el-aside width="260px">
      <ul class="slider-menu">
        <el-input style="width: 220px; padding: 20px;" placeholder="搜索联系人"></el-input>
        <li :class="{active:slider.select===0}" @click="slider.select=0">新的朋友</li>
        <li :class="{active:slider.select===1}" @click="slider.select=1">
          所有联系人({{ friendList ? friendList.length : 0 }})
        </li>
      </ul>
    </el-aside>
    <el-main>
      <el-container>
        <el-aside width="380px" style="background: #FFFFFF">
          <div style="width: 100%;">
            <el-button type="text" @click="addHandler" style="font-size: 24px; float: left;margin: 10px 20px;">
              <i class="el-icon-circle-plus-outline"/>
            </el-button>
            <el-button type="text" @click="refreshHandler" style="font-size: 24px; float: right;margin: 10px 20px;">
              <i class="el-icon-refresh"/>
            </el-button>
            <div class="clear"></div>
          </div>
          <div>
            <ul v-show="slider.select===0" v-for="(f,i) in friendApplyList" :key="i">
              <li class="app-friend-list" @click="openApplyFriendForm(i)" :class="{active:friendForm.id===f.id}">
                <el-avatar shape="square" :src="f.fImg" :size="40" class="avatar" slot="reference">
                  {{ f.fNickName ? f.fNickName.substring(0, 1) : '#' }}
                </el-avatar>
                <div class="title">
                  <p>
                    {{ f.fNickName ? f.fNickName : f.fPhone }}
                  </p>
                  <p>{{ f.fEmail }}</p>
                </div>
                <div class="status">
                  {{ ['未通过', '通过', '过期', '拒绝'][f.fStatus] }}
                </div>
              </li>
            </ul>
          </div>
          <div>
            <ul v-show="slider.select===1" v-for="(f,i) in friendList" :key="i">
              <li class="app-friend-list" @click="openFriendForm(i)" :class="{active:friendForm.id===f.id}">
                <el-avatar shape="square" :src="f.userImg" :size="40" class="avatar" slot="reference">
                  {{ f.nickAfter ? f.nickAfter.substring(0, 2) : (f.nickName ? f.nickName.substring(0, 2) : '#') }}
                </el-avatar>
                <div class="title">
                  <p>
                    {{ f.nickName ? f.nickName : f.phone }}
                  </p>
                  <p>{{ f.nickAfter }}</p>
                </div>
              </li>
            </ul>
          </div>
        </el-aside>
        <el-main v-show="friendForm.id">
          <div class="friend-form">
            <el-avatar shape="square" :src="friendForm.userImg" :size="84" class="avatar" slot="reference">
              {{ friendForm.nickAfter ? friendForm.nickAfter.substring(0, 1) : '#' }}
            </el-avatar>
            <div class="title">
              <p>
                {{ friendForm.nickAfter ? friendForm.nickAfter : friendForm.nickName }}
                <img :src="sendMsgBtn" alt="发送消息" @click="sendMsg" v-show="friendType===1">
                <img :src="sendEmailBtn" alt="发送邮件" @click="sendEmail" v-show="friendType===1">
              </p>
              <p>{{ friendForm.email }}</p>
            </div>
          </div>
          <el-form :model="friendForm" label-width="80px">
            <el-form-item label="备注">
              <el-input v-model="friendForm.nickAfter" type="text" style="width: 276px;"/>
            </el-form-item>
            <el-form-item label="账号">
              <el-input v-model="friendForm.email" type="text" style="width: 276px;" disabled/>
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="friendForm.phone" type="text" style="width: 276px;" disabled/>
            </el-form-item>
            <el-form-item label="来源">
              <el-input v-model="friendForm.inWay" type="text" style="width: 276px;" disabled/>
            </el-form-item>
            <el-form-item>
              <el-button type="danger" @click="submitFriendForm(0)" v-show="friendType===0&&friendForm.status===0">拒绝
              </el-button>
              <el-button type="primary" @click="submitFriendForm(1)" v-show="friendType===0&&friendForm.status===0">接受
              </el-button>
              <el-button type="danger" @click="delFriend" v-show="friendType===1">删除</el-button>
              <el-button type="primary" @click="submitFriendForm" v-show="friendType===1">修改</el-button>
            </el-form-item>
          </el-form>
        </el-main>
      </el-container>
    </el-main>
    <el-dialog :visible="addFriend.visible"
               title="添加联系人"
               @close="addFriend.visible=false"
               width="460px"
               center>
      <el-input v-model="addFriend.keyword" style="width: 376px; padding: 20px;"
                placeholder="手机号/邮箱账号">
        <el-button slot="append" icon="el-icon-search" @click="searchUser"/>
      </el-input>
      <ul v-for="(u,i) in addFriend.users" :key="i">
        <li class="add-friend-list">
          <el-avatar shape="square" :src="u.avatar" :size="40" class="avatar" slot="reference">
            {{ u.emailName ? u.emailName.substring(0, 1) : '#' }}
          </el-avatar>
          <div class="title">
            <p>
              {{ u.phone }}
            </p>
            <p>{{ u.emailName }}</p>
          </div>
          <el-button type="text" @click="applyHandler(i)" class="btn">
            <i class="el-icon-circle-plus-outline"/>
          </el-button>
          <div class="clear"></div>
        </li>
      </ul>
      <el-dialog
          width="460px"
          title="申请添加朋友"
          :visible.sync="addFriend.innerVisible"
          center
          append-to-body>
        <li class="add-friend-list">
          <el-avatar shape="square" :src="addFriend.avatar" :size="40" class="avatar" slot="reference">
            {{ addFriend.form.address ? addFriend.form.address.substring(0, 1) : '#' }}
          </el-avatar>
          <div class="title">
            <p>
              {{ addFriend.form.itemPhone }}
            </p>
            <p>{{ addFriend.form.address }}</p>
          </div>
        </li>
        <el-form :model="addFriend.form" label-position="top">
          <el-form-item label="验证人需要验证您的身份，请输入您的请求信息">
            <el-input v-model="addFriend.form.name" type="textarea" resize='none'></el-input>
          </el-form-item>
          <el-form-item label="设置备注">
            <el-input v-model="addFriend.form.fNickAfter" type="textarea" resize='none'></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button style="width: 98px;margin: 20px" @click="cancelApply">取消</el-button>
          <el-button style="width: 98px;margin: 20px" type="primary" @click="sendApply">发送</el-button>
        </div>
      </el-dialog>
    </el-dialog>
  </el-container>
</template>

<script>
import {
  findUserByPhoneOrEmail,
  askForFriend,
  agreeAndAddAddressBook,
  rejectFriendApply,
  updateFriendNickAfter,
  deleteSiKongAddressBook
} from "@/api/contact"
import {mapActions, mapGetters} from "vuex"

export default {
  name: "contactView",
  data() {
    return {
      sendEmailBtn: require('assets/images/email/send-email-btn.png'),
      sendMsgBtn: require('assets/images/email/send-msg-btn.png'),
      slider: {
        select: 0
      },
      addFriend: {
        visible: false,
        keyword: '',
        users: [],
        innerVisible: false,
        avatar: '',
        form: {
          phone: "",  // 登录人手机号
          itemPhone: "",  //要申请添加好友人的手机号
          address: "",//被申请添加好友那人的邮箱号
          fMessage: "",  // 添加留言
          fNickAfter: "",  // 添加后的昵称
          inWay: '1'
        }
      },
      friendType: -1,
      friendForm: {
        id: '',
        userImg: '',
        nickAfter: '',
        phone: '',
        email: '',
        nickName: ''
      }
    }
  },
  computed: {
    ...mapGetters(["userInfo", 'friendList', 'friendApplyList'])
  },
  mounted() {
    this.getFriendApplyList()
    this.getFriendList()
  },
  watch: {
    "slider.select": function (val) {
      this.getList(val)
      this.friendForm = {
        id: '',
        userImg: '',
        nickAfter: '',
        phone: '',
        email: ''
      }
    }
  },
  methods: {
    ...mapActions(['getFriendApplyList', 'getFriendList','addOrUpdateNearContactList']),
    getList(val) {
      switch (val) {
        case 0:
          this.getFriendApplyList()
          break
        case 1:
          this.getFriendList()
          break
      }
    },
    addHandler() {
      this.addFriend.visible = true
      this.addFriend.keyword = '13087649695'
      this.searchUser()
    },
    refreshHandler() {
      this.getList(this.slider.select)
    },
    searchUser() {
      if (!this.addFriend.keyword || !this.addFriend.keyword.trim()) return
      const keyword = this.addFriend.keyword.trim()
      findUserByPhoneOrEmail({findInfo: keyword}).then(res => {
        this.addFriend.users = res.data.list
      })
    },
    applyHandler(i) {
      const user = this.addFriend.users[i]
      this.addFriend.avatar = user.avatar
      this.addFriend.form = {
        phone: this.userInfo.phone,
        itemPhone: user.phone,
        address: user.emailName,
        fMessage: '',
        fNickAfter: '',
        inWay: '1'
      }
      this.addFriend.innerVisible = true
    },
    cancelApply() {
      this.addFriend.form = {
        phone: "",
        itemPhone: "",
        address: "",
        fMessage: "",
        fNickAfter: "",
        status: "1",
        inWay: '1'
      }
      this.addFriend.innerVisible = false
    },
    sendApply() {
      askForFriend(this.addFriend.form).then(res => {
        this.addFriend.visible = false
        this.addFriend.innerVisible = false
        this.getList(this.slider.select)
      })
    },
    openApplyFriendForm(i) {
      const friend = this.friendApplyList[i]
      this.friendType = 0
      this.friendForm = {
        id: friend.id,
        userImg: friend.fImg,
        phone: friend.fPhone,
        email: friend.fEmail,
        status: friend.fStatus,
        nickAfter: '',
        nickName: friend.fNickName,
        inWay: friend.inWay === '1' ? '手机号或邮箱账号添加' : '二维码添加'
      }
    },
    openFriendForm(i) {
      const friend = this.friendList[i]
      this.friendType = 1
      this.friendForm = {
        id: friend.id,
        userImg: friend.userImg,
        phone: friend.phone,
        email: friend.email,
        nickAfter: friend.nickAfter,
        nickName: friend.nickName,
        inWay: friend.inWay === '1' ? '手机号或邮箱账号添加' : '二维码添加'
      }
      console.log(this.friendForm)
    },
    async submitFriendForm(flag) {
      switch (this.friendType) {
        case 0:
          // 申请
          if (flag === 1) {
            //同意
            await agreeAndAddAddressBook({
              phone: this.userInfo.phone,
              applyPhone: this.friendForm.phone,
              applyAfterNickName: this.friendForm.nickAfter ? this.friendForm.nickAfter : ''
            })
          } else {
            await rejectFriendApply({
              phone: this.userInfo.phone,
              applyPhone: this.friendForm.phone,
            })
          }
          this.$message.success('处理成功')
          this.getFriendApplyList()
          break
        case 1:
          await updateFriendNickAfter({
            phone: this.friendForm.phone,
            nickAfter: this.friendForm.nickAfter
          })
          this.$message.success('修改成功')
          this.getFriendList()
          break
      }
    },
    delFriend() {
      this.$confirm('确定删除好友？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteSiKongAddressBook({
          itemPhone: this.friendForm.phone
        }).then(res => {
          this.$message.success('删除成功')
          this.getFriendList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    sendMsg() {
      this.addOrUpdateNearContactList({
        userId: this.friendForm.id,
        name: this.friendForm.nickAfter?this.friendForm.nickAfter:this.friendForm.nickName,
        email: this.friendForm.email,
        avatar: this.friendForm.userImg,
      })
      this.$router.replace("/home/chat?index=0")
    },
    sendEmail() {

    }
  }
}
</script>
<style lang="scss">
.mineContact {
  .el-main {
    padding: 0;

    .el-main {
      padding: 20px;
    }
  }

  .el-input__inner {
    height: 30px;
  }

  ul {
    list-style-type: none;

    li {
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #000000;
      border-radius: 4px;
      margin: 0 20px;
      padding: 14px 20px;

      &:hover {
        background-color: #abbef1;
        color: #FFFFFF;
      }
    }

    .active, .active:hover {
      background-color: #4F77E1;
      color: #FFFFFF;
    }
  }

  .clear {
    clear: both;
  }
}
</style>
<style scoped lang="scss">
.slider-menu {
  li {
    padding: 14px 20px;
  }
}

.add-friend-list {
  display: flex;
  color: #333333;

  .avatar {
    margin-right: 20px;
  }

  .title {
    width: 240px;

    p {
      height: 22px;
      font-size: 16px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      line-height: 22px;
    }
  }

  .btn {
    font-size: 24px;
    padding-top: 0;
    padding-bottom: 0;
  }
}
.friend-form{
  margin-top: 160px;
  margin-bottom: 20px;
  display: flex;
  .avatar {
    margin-right: 20px;
  }
  .title {
    p{
      height: 42px;
      font-size: 30px;
      font-family: PingFangSC-Semibold, PingFang SC;
      font-weight: 600;
      color: #333333;
      line-height: 42px;
      img {
        width: 40px;
        height: 40px;
        margin-left: 30px;
      }
    }
  }
}
.app-friend-list {
  display: flex;
  color: #333333;

  .avatar {
    margin-right: 20px;
  }

  .title {
    width: 198px;

    p {
      height: 22px;
      font-size: 16px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      line-height: 22px;
    }
  }

  .status {
    width: 42px;
    height: 20px;
    font-size: 14px;
    color: #999999;
    line-height: 20px;
  }
}
</style>
