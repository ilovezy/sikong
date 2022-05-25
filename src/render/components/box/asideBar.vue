<template>
  <div class="header-menu">
    <div style="border-bottom: dashed 1px #cbced1;padding: 10px 0;">
      <div v-for="item in pathList" :key="item.name" class="disk-item"
        :class="{'active': item.filename === curPath}" @click="setCur(item)">
        <span :class="item.type" class="item-icon"></span>
        <span>{{ item.name }}</span>
      </div>
    </div>
    <div style="padding: 10px 0;">
      <div v-for="(item, index) in disk" :key="index" class="disk-item"
        :class="{'active': item.filename === curPath}" @click="setCur(item)">
        <span class="item-icon disk-icon"></span>
        <span>本地磁盘{{ item.filename }}</span>
      </div>
    </div>
  </div>
</template>
<script>
  import { getDiskApi, getUserFolderApi } from '@/api/box'
  const dirName = {
    Desktop: '桌面',
    Downloads: '下载',
    Music: '音乐',
    Documents: '文档',
    Pictures: '图片',
    Videos: '视频'
  }
  export default{
    name: 'asidemenu',
    data () {
      return {
        disk: [],
        pathList: [{
          name: '桌面',
          path: 'Desktop',
          type: 'desktop'
        }],
        curPath: 'Desktop'
      }
    },
    methods: {
      async fetchData () {
        this.fetchDisk()
        this.getUserFolder()
      },
      setCur (item) {
        this.curPath = item.filename
        this.$emit('setPath', item)
      },
      async getUserFolder () {
        let {data} = await getUserFolderApi()
        if (data.status) {
          this.pathList = data.data.map(item => {
            item.name = dirName[item.filename]
            item.type = item.filename.toLowerCase()
            item.isDisk = true
            return item
          })
        }
      },
      async fetchDisk () {
        let { data } = await getDiskApi()
        this.disk = data.data.map(item => {
          return {
            filename: item,
            path: item + '/',
            isDisk: true
          }
        })
      }
    },
    created () {
      this.fetchData()
    }
  }
</script>
<style scoped>
.header-menu{
  height: 100%;
  width: 180px;
  text-align: center;
  border-right: solid 1px #cbced1;
}
.disk-item{
  height: 36px;
  line-height: 36px;
  cursor: pointer; 
  display: flex;
  align-items: center;
  padding-left: 20px;
}
.disk-item:hover{
  background-color: #dde0e4;
}
.disk-item.active{
  background-color: #dde0e4;
}
.item-icon{
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-right: 10px;
}
.disk-icon{
  background: url(../../assets/images/box/disk.png) no-repeat center;
}
.disk-item.active .disk-icon{
  background: url(../../assets/images/box/diskblue.png) no-repeat center;
}
.desktop{
  background: url(../../assets/images/box/desktop.png) no-repeat center;
}
.documents{
  background: url(../../assets/images/box/documents.png) no-repeat center;
}
.downloads{
  background: url(../../assets/images/box/downloads.png) no-repeat center;
}
.music{
  background: url(../../assets/images/box/music.png) no-repeat center;
}
.videos{
  background: url(../../assets/images/box/videos.png) no-repeat center;
}
.pictures{
  background: url(../../assets/images/box/pictures.png) no-repeat center;
}
</style>
