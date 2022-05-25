<template>
  <el-container>
    <el-aside width="80px">
      <main-menu/>
    </el-aside>
    <el-main>
      <transition name="fade">
        <router-view></router-view>
      </transition>
    </el-main>
  </el-container>
</template>

<script>
import MainMenu from "layout/MainMenu.vue";

export default {
  name: "Layout",
  components: {
    MainMenu,
  }
}
</script>

<style lang="scss" scoped>

.el-header {
  padding: 0 !important;
}

.el-aside {
}

.el-main {
  padding: 0 !important;
}

.fade-enter {
  visibility: hidden;
  opacity: 0;
}

.fade-leave-to {
  display: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .5s ease;
}

.fade-enter-to,
.fade-leave {
  visibility: visible;
  opacity: 1;
}
</style>
