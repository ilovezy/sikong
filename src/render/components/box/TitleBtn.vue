<template>
  <div class="titlebtn" v-bind:style="style" v-on:click="click">
    <i class="el-icon-close" v-if="type==='close'"></i>
    <i class="el-icon-minus" v-if="type==='min'"></i>
    <i :class="[isMax?'mc-maxwin':'mc-zuidahua']" v-if="type==='max'"></i>
  </div>
</template>
<script>
const { ipcRenderer: ipc } = require('electron')
let style = {
  min: {
    right: '80px'
  },
  max: {
    right: '40px'
  },
  close: {
    right: '0px'
  }
}
export default {
  name: 'Titlebtn',
  props: ['type'],
  data () {
    return {
      isMax: false
    }
  },
  computed: {
    style: function () {
      return style[this.type]
    }
  },
  methods: {
    click: function () {
      ipc.send(this.type)
      if (this.type === 'max') {
        this.isMax = !this.isMax
      }
    }
  }
}
</script>
<style scoped>
.titlebtn {
  position: absolute;
  width: 14px;
  height: 14px;
  -webkit-app-region: no-drag;
  display: flex;
  align-items: center;
 
}
.titlebtn  i {
    /* color: #ffffff; */
    font-size: 14px;
  }
</style>