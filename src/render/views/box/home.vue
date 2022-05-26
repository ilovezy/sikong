<template>
  <div class="home-box">
    <div class="path-box">
      <i class="el-icon-arrow-left" :class="{'disabled': record.curIdx < 1}" @click="getHistory('last')"></i>
      <i class="el-icon-arrow-right" :class="{'disabled': record.curIdx === record.paths.length - 1}" @click="getHistory('next')"></i>
      <div class="path">
        <img src="@/assets/images/box/types/directory.png" height="20px" />
        <input class="path-input" v-model="curPath" @keyup.enter="setParams(curPath)" />
      </div>
    </div>
    <div style="width:100%;height: calc(100% - 48px);display:flex;">
      <asideBar ref="asideBar" @setPath="setPath"></asideBar>
      <div class="content-box">
        <div class="flex-box header">
          <div class="name">名称</div>
          <div class="size" style="height:30px;">大小</div>
          <div class="type" style="height:30px;">类型</div>
          <div class="time">修改时间</div>
        </div>
        <div class="flex-box"
        v-for="(item, index) in paths" :key="index"
        :class="{'active': item.filename === curFile}"
        @dblclick="getNextPath(item)"
        @click="setCurFile(item)">
          <div class="name">
            <img v-if="item.isDirectory" src="@/assets/images/box/types/directory.png" />
            <img v-else-if="item.isTxt" src="@/assets/images/box/types/txt.png" />
            <img v-else-if="item.isPdf" src="@/assets/images/box/types/pdf.png" />
            <img v-else-if="item.isImg" src="@/assets/images/box/types/image.png" />
            <img v-else-if="item.isVideo" src="@/assets/images/box/types/video.png" />
            <img v-else-if="item.isMusic" src="@/assets/images/box/types/music.png" />
            <img v-else-if="item.isWord" src="@/assets/images/box/types/word.png" />
            <img v-else-if="item.isPPT" src="@/assets/images/box/types/ppt.png" />
            <img v-else-if="item.isExcel" src="@/assets/images/box/types/excel.png" />
            <img v-else-if="item.isEncrypted" src="@/assets/images/box/types/encrypted.png" />
            <img v-else-if="item.isOther" src="@/assets/images/box/types/other.png" />
            <span style="display:inline-block;width: calc(100% - 45px);height:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;"
              :title="item.filename">{{item.filename}}</span>
          </div>
          <div class="size">{{getfilesize(item.size)}}</div>
          <div class="type">{{item.label}}</div>
          <div class="time">{{item.mtime}}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { getPathInfoApi } from '@/api/box'
  import { getfilesize } from '@/utils'
  import asideBar from '@/components/box/asideBar.vue'
  import { mapMutations, mapGetters } from 'vuex'
  export default {
    data () {
      return {
        paths: [],
        curPath: '', // 当前路径
        params: {
          pathname: 'Desktop'
        },
        curDirName: 'Desktop', // 当前目录名称
        curFile: '', // 当前选择文件
        curSize: '' // 当前选择文件size
      }
    },
    components: {
      asideBar
    },
    computed: {
      ...mapGetters(['record'])
    },
    methods: {
      ...mapMutations(['setRecord']),
      getfilesize (size) {
        return getfilesize(size)
      },
      async fetchData (type) {
        let { data } = await getPathInfoApi(this.params)
        if (data.status) {
          this.paths = data.data
          this.curPath = data.path
          this.setRecord({
            path: data.path,
            catalog: this.curDirName,
            type: type
          }) // 传入record记录
        } else {
          this.$message({
            message: data.msg,
            type: 'error'
          })
        }
      },
      async setPath (item) {
        this.params.pathname = item.path
        this.curDirName = item.filename
        this.fetchData('catalog')
        this.curFile = ''
        this.curSize = ''
      },
      getNextPath (item) {
        if (item.isDirectory) {
          this.params.pathname = this.curPath + '/' + item.filename
          this.fetchData()
        }
      },
      async setParams (val) {
        this.params.pathname = val || this.curPath
        await this.fetchData()
      },
      // 获取上级目录信息
      getHistory (type) {
        let _record = this.record
        let _catalogs = _record.catalog
        let _paths = _record.paths
        let _idx = _paths.indexOf(this.curPath)
        if (type === 'last') _idx--
        else _idx++
        this.$refs.asideBar.curPath = _catalogs[_idx]
        this.curDirName = _catalogs[_idx]
        this.setParams(_paths[_idx])
      },
      async getCurDisk (fullPath) {
        var pos = fullPath.lastIndexOf('/')
        this.curPath = fullPath.substring(0, pos)
        let disk = fullPath.substring(0, fullPath.indexOf('/'))
        this.curFile = fullPath.substring(pos + 1)
        this.$refs.asideBar.curPath = disk
        await this.setParams(this.curPath)
        let filter = this.paths.filter(item => item.filename === this.curFile)
        if (filter.length) {
          this.curSize = filter[0].size
        }
      },
      setCurFile (item) {
        if (!item.isDirectory) {
          this.curFile = item.filename
          this.curSize = item.size
        }
      }
    },
    created () {
      this.fetchData()
    }
  }
</script>
<style scoped>
.path-box{
	background-color: #e5e9ed;
  padding: 5px 20px;
  border-bottom: solid 1px #c1c7d0;
  display: flex;
  align-items: center;
}
.path-box > i{
  margin-right: 20px;
  color: #405994;
  cursor: pointer;
}
.path-box i.disabled{
  color: #b5bdc4;
  pointer-events: none;
  cursor: not-allowed;
}
.path{
  flex: 1;
  width: 200px;
  height: 26px;
	background-color: #ffffff;
	border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 5px;
}
.path img{
  height: 16px;
  margin-right: 10px;
}
.path-input{
  flex: 1;
  width: 100px;
  font-family: SourceHanSansCN-Regular;
  font-size: 14px;
	line-height: 16px;
	color: #333333;
  border: none;
  outline: none;
}
.content-box{
  flex: 1;
  width: 200px;
  overflow: auto;
}
.flex-box{
  display: flex;
  align-items: center;
  font-family: MicrosoftYaHei;
	font-size: 16px;
	line-height: 50px;
	color: #222222;
  padding: 0 10px;
  background: #ffffff;
}
.flex-box.header{
  font-family: MicrosoftYaHei;
	font-size: 14px;
	line-height: 30px;
	color: #666666;
  border-bottom: solid 1px #c1c7d0;
}
.flex-box.header:hover{
  background: #ffffff;
  color: #666666;
}
.flex-box.header > div{
  border-right: solid 1px #c1c7d0;
}
.flex-box.header .time{
  border-right: 0px;
}
.flex-box > div{
  padding: 0 10px;
}
.flex-box .size, .flex-box .type{
  width: 160px;
  height: 60px;
  flex: none;
}
.flex-box .time{
  width: 150px;
  white-space: nowrap;
  flex: none;
}
.flex-box .name{
  flex: 1;
  width: 300px;
  display: flex;
  align-items: center;
}
.flex-box .name img{
  width: 30px;
  margin-right: 15px;
}
.flex-box:nth-child(2n) {
  background-color: #f8f9fa;
}
.flex-box:hover, .flex-box.active{
  background-color: #5c8add;
  color: #ffffff;
}
</style>
