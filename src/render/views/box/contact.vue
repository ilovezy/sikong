<template>
  <div>
    <el-dialog
      class="mc-dialog"
      custom-class="veri-hori"
      :visible.sync="contactShow"
      top="0"
      width="460px"
    >
      <div class="contact-box" style="width:460px;">
        <div class="title">好友管理</div>
        <div class="search-box">
          <el-input v-model="search" @keyup.enter.native="searchContact"></el-input>
          <div @click="searchContact" class="search-btn">搜索</div>
        </div>
        <div class="contact">
          <div class="letter-search">
            <span
              v-for="item in letters"
              :key="item"
              :class="{'active': activeLetter === item}"
              @click="letterSearch(item)"
            >{{ item }}</span>
          </div>
          <el-checkbox
            class="all-check"
            v-model="checkAll"
            @change="handleCheckAll"
            style="margin-bottom: 5px;"
          >全选</el-checkbox>
          <!-- <div class="item" v-for="(item, index) in contacts.filter(item => item.nickName.includes(search))" :key="index">
            <div class="check">
              <el-checkbox-group v-model="cIds" @change="handleCheck">
                <el-checkbox :label="item.id">{{ item.nickName }}</el-checkbox>
              </el-checkbox-group>
            </div>
            <div class="name">{{item.nickName}}</div>
            <div class="phone">{{item.phone}}</div>
          </div>-->
          <div v-for="(letterGroup, index) in letterList" :key="index">
            <div class="upper-letter">{{ letterGroup.letter }}</div>
            <div class="item" v-for="item in letterGroup.contacts" :key="item.id">
              <div class="check">
                <el-checkbox-group v-model="cIds" @change="handleCheck">
                  <el-checkbox :label="item.id">{{ item.nickName }}</el-checkbox>
                </el-checkbox-group>
              </div>
              <div class="name">{{item.nickName}}</div>
              <div class="phone">{{item.phone}}</div>
            </div>
          </div>
        </div>
        <div class="operate">
          <el-button size="mini" @click="delContact">删除</el-button>
          <el-button type="primary" size="mini" @click="addShow = true">新增</el-button>
          <el-button type="primary" size="mini" @click="getContactList">刷新</el-button>
        </div>
      </div>
    </el-dialog>
    <el-dialog
      class="mc-dialog"
      custom-class="veri-hori"
      :visible.sync="addShow"
      top="0"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="contact-box">
        <div class="title">新增好友</div>
        <div class="form-item">
          <div class="label">姓名</div>
          <el-input v-model="addInfo.nickName"></el-input>
        </div>
        <div class="form-item">
          <div class="label">公司</div>
          <el-input v-model="addInfo.company"></el-input>
        </div>
        <div class="form-item">
          <div class="label">手机</div>
          <el-input v-model="addInfo.phone"></el-input>
        </div>
        <div class="operate">
          <el-button type="primary" size="mini" @click="addContact">确定</el-button>
          <el-button size="mini" @click="addShow = false">取消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
  getContactListApi,
  enOrDecryptedApi,
  addressBookApi,
  deleteAddressBookApi
} from '@/api/box'
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      contactShow: false,
      search: '',
      contacts: [],
      checkAll: false,
      cIds: [],
      addShow: false,
      addInfo: {},
      letters: [], // 字母列表
      letterList: [], // 最终有字母的列表
      activeLetter: ''
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'ksId', 'ks'])
  },
  methods: {
    handleCheckAll (val) {
      if (val) {
        let options = this.contacts.map((item) => item.id)

        if (options.length > 50) {
          this.cIds = options.slice(0, 50)
          this.$message({
            message: '一次最多可以选择50条记录',
            type: 'error'
          })
        } else {
          this.cIds = options
        }
      } else {
        this.cIds = []
      }
    },
    handleCheck (val) {
      this.checkAll = val.length === this.contacts.length
    },
    letterSearch (letter) {
      let list = this.letters.map((item) => {
        let filter = this.contacts.filter((contact) => contact.letter === item)
        return {
          letter: item,
          contacts: [...filter]
        }
      })
      if (letter) {
        if (this.activeLetter === letter) {
          this.activeLetter = ''
          this.letterList = list
        } else {
          this.activeLetter = letter
          this.letterList = list.filter((item) => item.letter === letter)
        }
      } else {
        this.letterList = list
      }
    },
    searchContact () {
      this.activeLetter = ''
      let list = this.contacts
      if (this.search) {
        list = this.contacts.filter((item) =>
          item.nickName.includes(this.search)
        )
      }
      let letters = list.map((item) => item.letter)
      letters = Array.from(new Set(letters))
      this.letterList = letters.map((item) => {
        let filter = list.filter((contact) => contact.letter === item)
        let contact = [...filter]
        return {
          letter: item,
          contacts: contact
        }
      })
      console.log(this.letterList)
    },

    async getContactList () {
      let userInfo = this.userInfo
      let postData = {
        ksId: this.ksId,
        content: userInfo.content,
        name: this.search
      }
      let { data } = await getContactListApi(postData)
      if (data && data.data) {
        let { data: result } = await enOrDecryptedApi({
          decrypted: 1,
          content: data.data,
          ks: this.ks
        })
        if (result && result.data) {
          result = JSON.parse(result.data)
          this.contacts = result.list
          this.contacts = result.list.map((item) => {
            if (item.pinyin) {
              item.letter = item.pinyin.substr(0, 1).toUpperCase()
            }
            return item
          })
          let letters = result.list.map((item) => item.letter)
          this.letters = Array.from(new Set(letters))
          this.letterSearch(this.activeLetter)
          localStorage.getItem('s_key')
        }
      }
    },
    async addContact () {
      let _add = this.addInfo
      if (!_add.nickName) {
        this.$message({
          message: '请输入姓名',
          type: 'error'
        })
        return
      }
      /* if (!_add.company) {
          this.$message({
            message: '请输入公司',
            type: 'error'
          })
          return
        } */
      if (!_add.phone) {
        this.$message({
          message: '请输入手机',
          type: 'error'
        })
        return
      }
      /* let filter = this.contacts.filter(item => item.phone === this.addInfo.phone)
        if (filter.length) {
          this.$message({
            message: '该手机号已经存在',
            type: 'error'
          })
          return
        } */
      await this.submitData()
      // this.contacts.push(this.addInfo)
      this.addShow = false
      this.addInfo = {}
    },
    // 增加好友接口
    async submitData () {
      let contentObj = { ...this.addInfo }
      /* if(this.contact.id) { // 是修改
          contentObj.id = this.contact.id
        } */
      let content = JSON.stringify(contentObj)
      let { data } = await enOrDecryptedApi({
        decrypted: 0,
        content: content,
        ks: this.ks
      })
      console.log('contact-res:', data)
      let postData = {
        ksId: this.ksId,
        content: data.data
      }
      /* if (contentObj.id) { // 是修改
          this.changeAddress(postData)
          return
        } */
      let { data: result } = await addressBookApi(postData)
      if (result.code === '00') {
        if (result.pcksId) {
          this.$store.dispatch('setKsid', {
            ksId: result.pcksId,
            ks: result.pcks
          })
        }
        this.getContactList()
      }
    },
    async delContact () {
      if (this.cIds.length === 0) {
        this.$message({
          message: '请先选择要删除的联系人！',
          type: 'error'
        })
        return
      }
      let content = JSON.stringify({ ids: this.cIds })
      let { data } = await enOrDecryptedApi({
        decrypted: 0,
        content: content,
        ks: this.ks
      })
      let postData = {
        ksId: this.ksId,
        content: data.data
      }
      let { data: result } = await deleteAddressBookApi(postData)
      if (result.code === '00') {
        if (result.pcksId) {
          this.$store.dispatch('setKsid', {
            ksId: result.pcksId,
            ks: result.pcks
          })
        }
        this.$message({
          message: '删除成功！',
          type: 'success'
        })
        this.getContactList()
      }
    }
  },
  created () {
    this.getContactList()
  }
}
</script>
<style scoped>
.contact-box {
  width: 400px;
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
.operate {
  text-align: center;
  margin-top: 20px;
}
.search-box {
  margin: 20px 0 10px;
  display: flex;
  align-items: center;
}
.search-btn {
  width: 78px;
  height: 36px;
  background-color: #ffffff;
  border-radius: 4px;
  border: solid 1px #cbced1;
  text-align: center;
  line-height: 34px;
  margin-left: 10px;
  cursor: pointer;
}
.contact {
  height: 300px;
  background-color: #ffffff;
  border-radius: 4px;
  border: solid 1px #cbced1;
  padding: 10px;
  box-sizing: border-box;
  overflow-y: auto;
  position: relative;
}
.letter-search {
  position: absolute;
  width: 13px;
  right: 10px;
  top: 32px;
  height: 100%;
  line-height: 20px;
}
.letter-search span {
  cursor: pointer;
}
.letter-search span.active {
  color: #5c8add;
}
.all-check {
  margin-left: 10px;
}
.item {
  display: flex;
  align-items: center;
  font-family: MicrosoftYaHei;
  font-size: 14px;
  line-height: 20px;
  padding: 8px 10px;
  font-weight: normal;
  font-stretch: normal;
  letter-spacing: 0px;
  color: #333333;
  border-bottom: solid 1px #e2e2e2;
}
.upper-letter {
  width: 100%;
  height: 24px;
  background-color: #f5f6f7;
  padding-left: 10px;
  line-height: 24px;
}
.check /deep/ .el-checkbox__label {
  display: none;
}
.check /deep/ .el-checkbox-group {
  display: flex;
  align-items: center;
}
.item .phone {
  width: 100px;
  color: #666666;
  font-size: 14px;
  font-weight: normal;
}
.item .name {
  flex: 1;
  width: 200px;
  margin: 0 20px;
}
.form-item {
  display: flex;
  align-items: center;
  margin-top: 16px;
}
.form-item .label {
  font-family: MicrosoftYaHei;
  font-size: 16px;
  font-weight: normal;
  color: #333333;
  margin-right: 10px;
  width: 40px;
}
</style>
