<template>
  <div class="mine-card">
    <div class="user-info">
      <el-avatar shape="square" :src="avatar" :size="50" fit="fit">{{ nameAvatar }}</el-avatar>
      <div class="title">
        <div class="name">{{ nickname }}</div>
        <div class="email">{{ email ? email.emailName : '' }}</div>
      </div>
    </div>
    <el-form ref="form" label-width="70px">
      <el-form-item label="昵称">
        <el-input v-model="form.nickname" @blur="updateUserInfo"></el-input>
      </el-form-item>
      <el-form-item label="账号">
        <el-input v-model="email.emailName">
          <el-popover
              slot="append"
              placement="right"
              width="260"
              trigger="click"
              title="配置邮箱">
            <mail-card/>
            <el-button shape="square" slot="reference" icon="el-icon-circle-plus-outline"></el-button>
          </el-popover>
        </el-input>
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="form.phone" disabled></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
import MailCard from "views/user/mailCard"
import {modifyUserInfo} from '@/api/user'

export default {
  name: "mineCard",
  components: {MailCard},
  computed: {
    ...mapGetters(['userInfo', 'avatar', 'nameAvatar', 'email']),
  },
  data() {
    return {
      nickname: '',
      form: {
        nickname: '',
        phone: '',
      }
    }
  },
  mounted() {
    this.nickname = this.userInfo?.nickName
    this.form = {
      nickname: this.userInfo?.nickName,
      phone: this.userInfo?.phone,
    }
  },
  methods: {
    ...mapActions(['changeNickName']),
    updateUserInfo() {
      const nickName = this.form.nickname
      const phone = this.userInfo?.phone
      modifyUserInfo({nickName, phone})
          .then(res => {
            this.changeNickName(nickName)
          })
          .catch(e => {
            this.form.nickname = this.nickname
            this.$message.error("昵称修改失败：" + e)
          })
    }
  }
}
</script>
<style lang="scss">
.mine-card {
  .el-input__inner {
    width: 256px;
    height: 30px;
  }

  .el-input-group {
    width: 256px;

    .el-input__inner {
      width: 200px;
    }
  }

  .el-input__icon {
    line-height: 30px;
  }

  .el-form-item {
    margin-bottom: 18px;
  }
}
</style>
<style scoped lang="scss">
.mine-card {
  .user-info {
    height: 40px;
    border-radius: 4px;
    padding: 15px 30px;
    display: flex;
    margin-bottom: 20px;

    .title {
      padding-left: 20px;

      .name {
        height: 28px;
        font-size: 20px;
        font-family: PingFangSC-Semibold, PingFang SC;
        font-weight: 600;
        color: #333333;
        line-height: 28px;
        width: 220px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .email {
        height: 28px;
        font-size: 16px;
        font-family: PingFangSC-Semibold, PingFang SC;
        font-weight: 600;
        color: #333333;
        line-height: 28px;
        width: 220px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>
