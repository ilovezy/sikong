<template>
      <div class="per-box">
        <div class="search-box">
          <el-input v-model="search" @keyup.enter.native="searchContact"></el-input>
          <div @click="searchContact" class="search-btn">搜索</div>
        </div>
        <div class="contact">
          <div class="item">
            <div class="name"></div>
            <div class="phone"></div>
            <div class="radio">完全控制</div>
            <!-- <div class="radio">禁止转发</div> -->
          </div>
          <div class="item" v-for="(item, index) in contacts.filter(item => item.nickName.includes(search))" :key="index">
            <div class="name">{{item.nickName}}</div>
            <div class="phone">{{item.phone}}</div>
            <div class="radio">
              <el-checkbox-group v-model="receivers">
                <el-checkbox :label="item.phone"></el-checkbox>
              </el-checkbox-group>
            </div>
            <!-- <div class="radio">
              <el-radio v-model="item.perm" label="2"></el-radio>
            </div> -->
          </div>
        </div>
        <div class="operate">
          <el-button type="primary" size="mini" @click="addReceivers">确定</el-button>
          <el-button size="mini" @click="cancel">取消</el-button>
        </div>
      </div>
</template>
<script>
  import { getContactListApi, enOrDecryptedApi, addReceiversApi, listReceiversApi } from '@/api/box'
  export default {
    data () {
      return {
        search: '',
        ks: localStorage.getItem('s_key'),
        ksId: localStorage.getItem('ksId'),
        loginData: localStorage.getItem('userInfo'),
        contacts: [],
        contactList: [],
        receivers: []
      }
    },
    props: {
      fileId: {
        type: String
      },
      model: {
        type: Boolean
      }
    },
    methods: {
      searchContact () {
        if (this.search) {
          this.contacts = this.contactList.filter(item => item.nickName.includes(this.search))
        } else {
          this.contacts = this.contactList
        }
      },
      cancel () {
        this.$emit('cancel')
      },
      async getContactList () {
        let userInfo = JSON.parse(this.loginData)
        let postData = {
          ksId: this.ksId,
          content: userInfo.content,
          name: this.search
        }
        let { data } = await getContactListApi(postData)
        if (data && data.data) {
          let { data: result } = await enOrDecryptedApi({decrypted: 1, content: data.data, ks: this.ks})
          if (result && result.data) {
            result = JSON.parse(result.data)
            this.contactList = result.list
            if (this.model) {
              this.dealData()
            } else {
              this.searchContact()
            }
            if(result.pcksId){
              this.$store.dispatch('setKsid',{ksId: result.pcksId,ks:result.pcks})
            }
          }
        }
      },
      async addReceivers () {
        // let receivers = this.contacts.filter(item => item.perm)
        // receivers = receivers.map(item => item.phone)
        let contentObj = {
          fileId: this.fileId,
          receivers: this.receivers
        }
        let content = JSON.stringify(contentObj)
        let { data: enData } = await enOrDecryptedApi({decrypted: 0, content: content, ks: this.ks})
        // console.log('contact-res:', data)
        let postData = {
          ksId: this.ksId,
          content: enData.data
        }
        let {data} = await addReceiversApi(postData)
        if (data.code === '00') {
          if (data.data) {
            let { data: result } = await enOrDecryptedApi({decrypted: 1, content: data.data, ks: this.ks})
            if (result && result.data) {
              result = JSON.parse(result.data)
              if(result.pcksId){
                this.$store.dispatch('setKsid',{ksId: result.pcksId,ks:result.pcks})
              }
            }
          }
          this.cancel()
        }
      },
      dealData () {
        if (!this.receivers.length || !this.contactList.length) {
          return
        }
        // this.contactList = this.contactList.map(item => {
        //   if (this.receivers.includes(item.phone)) {
        //     item.perm = 1
        //   } else {
        //     item.perm = 0
        //   }
        //   return item
        // })
        this.searchContact()
      },
      // 回显权限
      async listReceivers () {
        let contentObj = {
          fileId: this.fileId
        }
        let content = JSON.stringify(contentObj)
        let { data: enData } = await enOrDecryptedApi({decrypted: 0, content: content, ks: this.ks})
        let postData = {
          ksId: this.ksId,
          content: enData.data
        }
        let {data} = await listReceiversApi(postData)
        if (data.code === '00') {
          let { data: result } = await enOrDecryptedApi({decrypted: 1, content: data.data, ks: this.ks})
          if (result && result.data) {
            result = JSON.parse(result.data)
            this.receivers = result.receivers
            this.dealData()
            if(result.pcksId){
              this.$store.dispatch('setKsid',{ksId: result.pcksId,ks:result.pcks})
            }
          }
        }
      }
    },
    created () {
      this.getContactList()
      if (this.model) {
        this.listReceivers()
      }
    }
  }
</script>
<style scoped>
.per-box{
  width: 100%;
  /* padding: 30px 20px; */
  box-sizing: border-box;
	background-color: #f5f6f7;
	/* box-shadow: 0px 10px 24px 0px rgba(46, 52, 55, 0.32); */
	/* border-radius: 6px; */
	/* border: solid 1px #d5d8dc; */
}
.title{
  font-family: MicrosoftYaHei-Bold;
	font-size: 18px;
	font-weight: 700;
	line-height: 24px;
	letter-spacing: 1px;
	color: #50607d;
  text-align: center;
}
.tip{
  font-family: MicrosoftYaHei;
	font-size: 16px;
	color: #333333;
}
.operate{
  text-align: center;
  margin-top: 20px;
}
.search-box{
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
.contact{
	height: 300px;
	background-color: #ffffff;
	border-radius: 4px;
	border: solid 1px #cbced1;
  padding: 10px;
  box-sizing: border-box;
  overflow: auto;
}
.item{
  display: flex;
  align-items: center;
  font-family: MicrosoftYaHei;
	font-size: 14px;
  line-height: 30px;
	font-weight: normal;
	font-stretch: normal;
	letter-spacing: 0px;
	color: #333333;
}
.el-checkbox-group /deep/ .el-checkbox__label{
  display:none;
}
.item .radio {
  width: 80px;
  text-align: center;
}
.item .radio /deep/ .el-radio__label{
  display: none;
}
.item .name{
  width: 140px;
  padding-right: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item .phone{
  width: 140px;
}
</style>
