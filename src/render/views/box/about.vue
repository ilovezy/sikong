<template>
  <el-dialog class="mc-dialog" custom-class="veri-about" :visible.sync="aboutShow" top="0" title="关于">
    <iframe src="http://114.80.222.225:1111/store_protocol.html"></iframe>
  </el-dialog>
</template>
<script>
  export default {
    data () {
      return {
        aboutShow: false
      }
    }
  }
</script>
<style scoped>
iframe{
  border: none;
  width: 100%;
  height: 500px;
}
</style>
