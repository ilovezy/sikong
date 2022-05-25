<template>
  <div class="chat-search">
    <el-autocomplete
        class="inline-input chat-search-input"
        v-model="keyword"
        :fetch-suggestions="querySearch"
        placeholder="搜索联系人"
        :trigger-on-focus="false"
        clearable
        @select="handleSelect"
    >
      <template slot-scope="{ item }">
        <div class="name">{{ item.value }}</div>
        <span class="addr">{{ item.address }}</span>
        <Linkman :user="item"></Linkman>
      </template>
    </el-autocomplete>
    <el-button type="text" @click="addHandler" style="font-size: 24px;">
      <i class="el-icon-circle-plus-outline"/>
    </el-button>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'
import Linkman from "views/chat/linkman"

export default {
  name: "searchBar",
  data() {
    return {
      keyword: '',
    }
  },
  components: {Linkman},
  computed: {
    ...mapGetters(['contactList'])
  },
  methods: {
    handleSelect() {

    },
    querySearch(keyword, cb) {
      const contactList = this.contactList;
      const results = keyword ? contactList.filter(this.createFilter(keyword)) : contactList;
      cb(results);
    },
    createFilter(keyword) {
      return (linkman) => {
        return (linkman.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1);
      };
    },
    addHandler() {
      this.$emit('openSearchUserWindow')
    }
  }
}
</script>
<style lang="scss">
.chat-search-input {
  .el-input__inner {
    width: 296px;
    height: 30px;
  }

  .el-input__icon {
    line-height: 30px;
  }
}
</style>
<style lang="scss" scoped>
.chat-search {
  height: 100%;
  display: flex;
  align-items: center;

  > * {
    margin-left: 20px;
    -webkit-app-region: no-drag;
  }
}
</style>
