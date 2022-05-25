<template>
  <div class="index-box">
    <Header @about="about"
            @encry="dealFile(1)"
            @decry="dealFile(2)"
            @perm="perm">
    </Header>
<!--    <Header @contact="contact"-->
<!--            @about="about"-->
<!--            @encry="dealFile(1)"-->
<!--            @decry="dealFile(2)"-->
<!--            @perm="perm">-->
<!--    </Header>-->
    <Home class="index-home" ref="home"></Home>
<!--    <Contact ref="contact"></Contact>-->
    <About ref="about"></About>
    <el-dialog class="mc-dialog" custom-class="veri-hori"
               :visible.sync="decryShow" top="0" width="460px"
               :close-on-click-modal="false">
      <div class="contact-box">
        <div class="title">文件{{ title }}</div>
        <div class="form-item">
          <div class="tip">{{ curFile }}</div>
          <el-progress :percentage="percentage" :stroke-width="10"></el-progress>
          <p style="text-align:right;">{{ title }}<span>{{ progress }}</span></p>
        </div>
        <perlist v-if="title === '加密' && decryShow" :fileId="fileId" @cancel="decryShow = false"></perlist>
      </div>
    </el-dialog>
    <el-dialog class="mc-dialog" custom-class="veri-hori"
               :visible.sync="permShow" top="0" width="460px">
      <div class="contact-box">
        <div class="title">权限设置</div>
        <div class="tip">文档权限设置</div>
        <perlist :fileId="fileId" @cancel="permShow = false" :model="true" v-if="permShow"></perlist>
      </div>
    </el-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import {
  burstFileApi,
  submitFileKdRelationApi,
  enOrDecryptedApi,
  getSecretKeyApi,
  getFileIdApi,
  requireKdsByFileIdsApi
} from '@/api/box'
import Header from '../../components/box/header'
import Home from './home'
// import Contact from './contact'
import About from './about'
import {genID} from '../../utils'
import perlist from './perlist'
import {mapGetters} from 'vuex'

const ipc = require('electron').ipcRenderer
const remote = require('electron').remote
export default {
  components: {
    Header,
    Home,
    // Contact,
    About,
    perlist
  },
  data() {
    return {
      decryShow: false,
      curFile: null,
      curPath: null,
      title: '加密',
      kds: null,
      percentage: 0,
      permShow: false,
      fileId: '',
      isSecret: false, // 默认不是加密文件
      isExist: false, // 是否存在同名文件
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'ksId', 'ks']),
    progress() {
      if (this.percentage < 100) {
        return this.percentage + '%'
      } else {
        return '完成'
      }
    }
  },
  methods: {
    // // 好友管理弹框
    // contact() {
    //   this.$refs.contact.contactShow = true
    // },
    // 关于弹框
    about() {
      this.$refs.about.aboutShow = true
    },
    // 获取fileId及加解密状态
    async getFileId() {
      let _home = this.$refs.home
      let path = _home.curPath + '/' + _home.curFile
      let {data} = await getFileIdApi({content: path, name: _home.curFile})
      if (data && data.data) {
        this.fileId = data.data.fileId
        this.isSecret = data.data.isSecret
        this.isExist = data.data.isExist
      }
    },
    // 权限
    async perm() {
      let _home = this.$refs.home
      if (!_home.curFile) {
        this.message('请选择文件', 'error')
        return
      }
      await this.getFileId()
      if (!this.isSecret) {
        this.message('只能对加密文件设置权限！', 'warning')
        return
      }
      this.permShow = true
    },
    message(msg, type) {
      this.$message({message: msg, type: type})
    },
    // 获取密钥
    async getSecretKey(content) {
      let postData = {
        ksId: this.ksId,
        content: content
      }
      let data = await getSecretKeyApi(postData)
      if (data.code === '00' && data.data) {
        let {data: result} = await enOrDecryptedApi({decrypted: 1, content: data.data, ks: this.ks})
        if (result && result.data) {
          result = JSON.parse(result.data)
          if (result.pcksId) {
            this.$store.dispatch("setKsid", {ksId: result.pcksId, ks: result.pcks});
          }
          if (result.kds.length) {
            this.kds = result.kds[0]
          } else {
            this.kds = null
          }
        }
      }
    },
    // 加解密共有部分,1是加密，2是解密
    async dealFile(type, filename) {
      let _home = this.$refs.home
      if (filename) {
        this.curFile = filename
      } else {
        this.curFile = _home.curFile
      }
      this.title = type === 1 ? '加密' : '解密'
      if (!this.curFile) {
        this.message('请先选择需要' + this.title + '的文件！', 'warning')
        return
      }
      await this.getFileId() // 获取fileId及是否加密文件
      this.percentage = 0
      if (type === 1) {
        if (this.isSecret) {
          this.message('该文件已经是加密文件，无需加密！', 'warning')
          return
        }
        if (this.isExist) {
          this.$confirm('已存在名为' + this.curFile + '.wymc' + '的文件,继续操作将会覆盖该文件', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.encry()
          }).catch(() => {
            return
          })
          return
        }
        this.encry()
      } else {
        if (!this.isSecret) {
          this.message('该文件不是加密文件，无需解密！', 'warning')
          return
        }
        let kd = await this.decry()
        if (!kd) {
          return
        }
        if (this.isExist) {
          let name = this.curFile.replace(/(\([1-9][0-9]{0,1}\)){0,1}.wymc/g, '')
          this.$confirm('已存在名为' + name + '的文件,继续操作将会覆盖该文件', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            // this.toDecry()
            this.burst(kd, 'decry')
          }).catch(() => {
            return
          })
          return
        }
        // this.toDecry()
        this.burst(kd, 'decry')
      }
    },
    // 解密
    // async toDecry() {
    //   let kd = await this.decry()
    //   this.burst(kd, 'decry')
    // },
    // 加密
    async encry() {
      // 获取加密密钥
      let content = JSON.stringify({count: 1})
      let {data} = await enOrDecryptedApi({decrypted: 0, content: content, ks: this.ks})
      await this.getSecretKey(data.data)
      if (this.kds) {
        let id = this.$md5(genID())
        this.fileId = id
        this.burst(this.kds.kd, 'encry', id)
      }
    },
    // 分片上传
    async burst(ks, cryType, id) {
      if (!ks) {
        this.message('解密失败，没有权限', 'warning')
        return
      }
      debugger
      let _home = this.$refs.home
      let successNum = 0
      let index = 0
      let start = 0
      let end = 0
      this.burstOneByOne(_home, successNum, index, start, end, ks, cryType, id)
    },
    async burstOneByOne(_home, successNum, index, start, end, ks, cryType, id) {
      let _size = _home.curSize
      let bytesPerPiece = 1024 * 1024 * 5 // 5M一个分片
      let totalPieces = Math.ceil(_size / bytesPerPiece) // 切片总数
      if (start < _size) {
        end = start + bytesPerPiece
        if (end >= _size) end = _size // 匹配最后一个分片的情况
        let _params = {
          start: start,
          end: end,
          index: index,
          total: totalPieces, // 切片总数
          filepath: _home.curPath,
          filename: _home.curFile,
          ks: ks,
          cryType: cryType
        }
        if (id) {
          _params.fileId = id
        }
        let {data} = await burstFileApi(_params)
        if (data.status) {
          this.decryShow = true
          successNum++
          this.percentage = (100 * successNum / totalPieces).toFixed(2) - 0
          start = end
          index++
          if (index < totalPieces) {
            this.burstOneByOne(_home, successNum, index, start, end, ks, cryType, id)
          } else {
            if (id) {
              this.submitFileKdRelation(id) // 加密完成上报密钥与文件关系
            }
            this.$refs.home.fetchData()
          }
        } else {
          this.message(data.msg, 'error')
        }
      }
    },
    // 上报密钥关系
    async submitFileKdRelation(id) {
      let content = {'kdFileRelation': []}
      content.kdFileRelation.push({
        kdId: this.kds.kdId,
        fileId: id
      })
      content = JSON.stringify(content)
      let {data} = await enOrDecryptedApi({decrypted: 0, content: content, ks: this.ks})
      let postData = {
        ksId: this.ksId,
        content: data.data
      }
      let {data: result} = await submitFileKdRelationApi(postData)
      if (result.code === '00') {
        if (result.pcksId) {
          this.$store.dispatch("setKsid", {ksId: result.pcksId, ks: result.pcks});
        }
      }
    },
    // 解密
    async decry() {
      let kd = ''
      let content = {
        fileIds: [this.fileId]
      }
      content = JSON.stringify(content)
      let {data} = await enOrDecryptedApi({decrypted: 0, content: content, ks: this.ks})
      // 获取解密密钥
      let kdObj = await this.requireKdByFileId(data.data)
      console.log(kdObj)
      if (kdObj) {
        kd = kdObj.kd
        if (!kd) {
          this.message('您没有解密该文件的权限！', 'warning')
        }
      }
      return kd
    },
    // 获取解密密钥
    async requireKdByFileId(content) {
      let postData = {
        ksId: this.ksId,
        content: content
      }
      let {data} = await requireKdsByFileIdsApi(postData)
      if (data.code === '00' && data.data) {
        let {data: result} = await enOrDecryptedApi({decrypted: 1, content: data.data, ks: this.ks})
        if (result && result.data) {
          result = JSON.parse(result.data)
          if (result.pcksId) {
            this.$store.dispatch("setKsid", {ksId: result.pcksId, ks: result.pcks});
          }
          return result.files[0]
        }
      } else if (data.code === '09') {
        this.message('您没有解密该文件的权限！', 'warning')
      } else {
        this.message('获取解密密钥失败！', 'error')
      }
    },
    async getArgFile(args) {
      let fullPath = args[1].replace(/\\/g, '/')
      await this.$refs.home.getCurDisk(fullPath)
      // this.$refs.home.curFile = fullPath.substring(pos + 1)
      let type = args[2]
      this.dealFile(Number(type))
    },
    dealArgs(arr, disk) {
      // global.sharedObject = {
      //   prop1: process.argv
      // }
      // let args = remote.getGlobal('sharedObject').prop1
      let args = process.argv
      if (disk && arr.length > 4) {
        args[1] = arr[3]
        args[2] = arr[4]
      }
      console.log("666--:", args)
      let types = ['1', '2']
      if (args.length >= 3 && types.includes(args[2])) {
        args[1] = args[1].replace(/\\/g, '/')
        this.getArgFile(args)
      }
    }
  },
  mounted() {
    let _this = this
    this.dealArgs()
    ipc.on('getRightPath', function (event, argv, disk) {
      _this.dealArgs(argv, disk)
    })
  }
}
</script>
<style scoped>
.index-box {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.index-home {
  flex: 1;
  height: 200px;
  display: flex;
  flex-direction: column;
}

.contact-box {
  width: 460px;
  padding: 30px 20px;
  box-sizing: border-box;
  background-color: #f5f6f7;
  box-shadow: 0px 10px 24px 0px rgba(46, 52, 55, 0.32);
  border-radius: 6px;
  border: solid 1px #d5d8dc;
}

.title {
  font-family: MicrosoftYaHei-Bold;
  font-size: 18px;
  font-weight: 700;
  line-height: 24px;
  letter-spacing: 1px;
  color: #50607d;
  text-align: center;
}

.tip {
  font-family: MicrosoftYaHei;
  font-size: 16px;
  color: #333333;
  margin: 30px 0 12px;
}
</style>
