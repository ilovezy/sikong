<template>
  <div class="card" :class="{'active':active}">
    <el-badge :value="newMsgCount" :max="99" :hidden="!newMsgCount||newMsgCount<1">
      <el-avatar shape="square" :src="avatar" :size="40" fit="fit">{{ nameAvatar }}</el-avatar>
    </el-badge>
    <div class="title">
      <div class="name">{{ name }}</div>
      <div class="email">{{ email }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "linkman",
  props: ['active', 'name', 'email', 'avatar', 'newMsgCount'],
  computed: {
    nameAvatar() {
      let name = this.name
      return !name ? '?' : (name.length > 2 ? name.substring(0, 2) : name)
    }
  }
}
</script>

<style scoped lang="scss">
.card {
  width: 280px;
  height: 40px;
  border-radius: 4px;
  padding: 15px 30px;
  display: flex;

  .title {
    padding-left: 20px;

    .name {
      font-size: 18px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #333333;
      line-height: 25px;
      width: 220px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .email {
      font-size: 16px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #666666;
      line-height: 22px;
      width: 220px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

}

.card:hover {
  background-color: #abbef1;

  .title {
    .name {
      color: #FFFFFF;
    }

    .email {
      color: #FFFFFF;
    }
  }
}

.active {
  background-color: #4F77E1;

  .title {
    .name {
      color: #FFFFFF;
    }

    .email {
      color: #FFFFFF;
    }
  }
}
</style>
