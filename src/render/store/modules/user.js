import {db} from "@/plugins/db"
import {ipcRenderer} from "electron"
import moment from "moment"
import {md5} from "utils/encrypt"
import {requireKd, submitFileKdRelation} from "@/api/mail"
import {findFriendApplyByPhone, getAddressBookList} from "@/api/contact"

const state = {
  mac: localStorage.getItem("mac") || ipcRenderer.sendSync('mac'),
  ksId: localStorage.getItem("ksId"),
  ks: localStorage.getItem("ks"),
  token: localStorage.getItem('Admin-Token'),
  phone: sessionStorage.getItem('phone'),
  userInfo: localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo")) : null,
  contactList: [], // 通讯录列表
  nearContactList: sessionStorage.getItem('nearContactList') ? JSON.parse(sessionStorage.getItem('nearContactList')) : [], // 最近联系人列表
  email: localStorage.getItem("email") ? JSON.parse(localStorage.getItem("email")) : {emailName: ''},
  // 启动时默认追溯5天的邮件
  lastDate: moment().subtract(5, 'day').toDate(),
  kds: sessionStorage.getItem('kds') ? JSON.parse(sessionStorage.getItem('kds')) : [],
  friendList: localStorage.getItem('friendList') ? JSON.parse(localStorage.getItem('friendList')) : [],
  friendApplyList: localStorage.getItem('friendApplyList') ? JSON.parse(localStorage.getItem('friendApplyList')) : [],
  record: {
    paths: [],
    curIdx: -1,
    catalog: []
  }
}

const getters = {
  mac: state => state.mac,
  ksId: state => state.ksId,
  ks: state => state.ks,
  token: state => state.token,
  userInfo: state => state.userInfo,
  phone: state => state.phone,
  name: state => state.userInfo?.nickName,
  avatar: state => state.userInfo?.userImg,
  nameAvatar: state => {
    let name = state.userInfo?.nickName
    return !name ? '#' : (name.length > 2 ? name.substring(0, 2) : name)
  },
  contactList: state => state.contactList,
  nearContactList: state => state.nearContactList,
  email: state => state.email,
  lastDate: state => state.lastDate,
  friendList: state => state.friendList,
  friendApplyList: state => state.friendApplyList,
  record: state => state.record
}

const mutations = {
  SET_TOKEN: (state, token) => {
    localStorage.setItem('Admin-Token', token)
    state.token = token;
  },
  SET_KS: (state, {ksId, ks}) => {
    localStorage.setItem("ksId", ksId)
    localStorage.setItem("ks", ks)
    state.ksId = ksId
    state.ks = ks;
  },
  SET_USER_INFO: (state, info) => {
    localStorage.setItem('userInfo', JSON.stringify(info))
    state.userInfo = info
  },
  SET_PHONE: (state, data) => {
    sessionStorage.setItem('phone', data)
    state.phone = data
  },
  DEL_USER_INFO: (state) => {
    localStorage.removeItem('userInfo')
    localStorage.removeItem('email')
    localStorage.removeItem('Admin-Token')
    sessionStorage.removeItem('phone')
    sessionStorage.removeItem('nearContactList')
    sessionStorage.removeItem('kds')
    localStorage.removeItem('ksId')
    localStorage.removeItem('ks')
    localStorage.removeItem('friendList')
    localStorage.removeItem('friendApplyList')
    state.userInfo = null
    state.email = {emailName: ''}
    state.nearContactList = []
    state.lastDate = moment().subtract(5, 'day').toDate()
    state.ksId = null
    state.ks = null
    state.token = null
    state.friendApplyList = []
    state.friendList = []
    state.kds = []
    state.phone = null
  },
  SET_CONTACTS: (state, data) => {
    state.contactList = data;
  },
  INIT_NEAR_CONTACTS: (state, data) => {
    sessionStorage.setItem('nearContactList', JSON.stringify(data))
    state.nearContactList = data;
  },
  SET_NEAR_CONTACTS: (state, data) => {
    db.nearContacts.put(data)
    sessionStorage.setItem('nearContactList', JSON.stringify(data.arr))
    state.nearContactList = data.arr;
  },
  SET_LOGIN_OUT: (state) => {
    localStorage.removeItem('Admin-Token')
    sessionStorage.removeItem('phone')
    localStorage.removeItem('email')
    localStorage.removeItem('friendList')
    localStorage.removeItem('friendApplyList')
    state.email = {emailName: ''}
    state.token = null
    state.friendApplyList = []
    state.friendList = []
    state.phone = null
  },
  SET_LAST_DATE: (state, date) => {
    state.lastDate = date
  },
  SET_EMAIL: (state, email) => {
    state.email = email
    localStorage.setItem('email', JSON.stringify(email));
  },
  INIT_KDS: (state, data) => {
    state.kds = data
    sessionStorage.setItem('kds', JSON.stringify(data))
  },
  SET_KDS: (state, kds) => {
    db.kds.put({userId: state.userInfo.id, arr: kds})
    state.kds = kds
    sessionStorage.setItem('kds', JSON.stringify(kds))
  },
  SET_FRIEND_LIST: (STATE, list) => {
    localStorage.setItem('friendList', JSON.stringify(list))
    STATE.friendList = list
  },
  SET_FRIEND_APPLY_LIST: (STATE, list) => {
    localStorage.setItem('friendApplyList', JSON.stringify(list))
    STATE.friendApplyList = list
  },
  setRecord: (state, params) => {
    let _record = state.record
    let { path, catalog, type } = params
    if (type === 'catalog') { // 点击目录
      _record.paths.length = _record.curIdx + 1
      _record.paths.push(path)
      _record.catalog.length = _record.curIdx + 1
      _record.catalog.push(catalog)
      _record.curIdx++
    } else {
      let _idx = _record.paths.indexOf(path)
      if (_idx === -1) { // path不存在历史里分2种情况
        if (_record.curIdx === _record.paths.length - 1) { // curIdx等于长度时候，是正常点文件
          _record.paths.push(path)
          _record.catalog.push(catalog)
          _record.curIdx++
        } else { // curIdx不等于长度时候，是回退查看历史，当历史里不存在时，需要清空后面的path
          _record.paths.length = _record.curIdx + 1
          _record.paths.push(path)
          _record.catalog.length = _record.curIdx + 1
          _record.catalog.push(catalog)
          _record.curIdx++
        }
      } else { // path存在那么就是在历史里，需要将curIdx置为index
        _record.curIdx = _idx
      }
    }
  }

}

const actions = {
  async getKd({commit}) {
    let kds = state.kds
    if (!kds || kds.length <= 0) {
      const kdResult = await requireKd({"count": 10})
      kds = kdResult.data.kds
      const kdFileRelation = []
      for (const kd of kds) {
        kd.fileId = md5(kd.kdId)
        kdFileRelation.push({
          fileId: kd.fileId,
          kdId: kd.kdId
        })
      }
      await submitFileKdRelation({kdFileRelation})
    }
    const kd = kds.shift()
    commit('SET_KDS', kds)
    return kd
  },
  initUserData({commit}, {ks0, token}) {
    commit('SET_TOKEN', token)
    commit('SET_KS', {ksId: 0, ks: ks0});
  },
  // 登录
  Login({commit, dispatch}, data) {
    console.log("后端返回用户数据", data)
    commit('SET_KS', data);

    const user = data.mailUser
    ipcRenderer.send('login', data)
    commit('SET_USER_INFO', user);
    if (user.mail) {
      const obj = JSON.parse(user.mail)
      const email = obj.userInfo
      commit('SET_EMAIL', email)
      ipcRenderer.send('startMailSever', email)
    }
    commit('SET_PHONE', user.phone)
    dispatch('getFriendList', user.phone)
    dispatch('getFriendApplyList', user.phone)
    db.nearContacts.get(user.id)
      .then(data => {
        const nearContacts = data?.arr ? data.arr : []
        commit('INIT_NEAR_CONTACTS', nearContacts)
      })
      .catch(e => {
        console.error('数据库查询近期联系人失败：' + e)
      })
    db.kds.get(user.id)
      .then(data => {
        const kds = data?.arr ? data.arr : []
        commit('INIT_KDS', kds)
      })
      .catch(e => {
        console.error('数据库查询kds失败：' + e)
      })

  },
  setNearContactList({commit, state}, nearContacts) {
    const arr = nearContacts ? nearContacts : []
    commit('SET_NEAR_CONTACTS', {userId: state.userInfo.id, arr})
  },
  setContactList({commit}, data) {
    commit('SET_CONTACTS', data);
  },
  // 前端 登出
  async FedLogOut({commit}) {
    await commit('SET_LOGIN_OUT');
  },
  changeAccount({commit}) {
    commit('DEL_USER_INFO');
  },
  changeNickName({commit}, nickName) {
    commit('SET_USER_INFO', {...state.userInfo, nickName})
  },
  setEmail({commit}, email) {
    // if (!email || !email.emailName || !email.emailPassword) return
    console.log(email)
    commit('SET_EMAIL', email)
  },
  setLastDate({commit, state}, date) {
    commit('SET_LAST_DATE', date)
  },
  getFriendApplyList({commit, state}, phone) {
    findFriendApplyByPhone({phone: phone ? phone : state.userInfo.phone}).then(res => {
      console.log('更新好友申请列表')
      commit('SET_FRIEND_APPLY_LIST', res.data.list)
    })
  },
  getFriendList({commit, state}, phone) {
    getAddressBookList({phone: phone ? phone : state.userInfo.phone}).then(res => {
      console.log('更新通讯录')
      commit('SET_FRIEND_LIST', res.data.list)
    })
  },
  addOrUpdateNearContactList({commit, state}, friend) {
    const list = state.nearContactList
    const index = list.findIndex(item => item.id === friend.id)
    if (index > -1) {
      friend.newMsgCount = (list[index].newMsgCount ? list[index].newMsgCount : 0) + 1
      // 删除之前元素
      list.splice(index, 1)
    } else {
      friend.newMsgCount = 1
    }
    list.unshift(friend)
    commit('SET_NEAR_CONTACTS', {userId: state.userInfo.id, arr: list})
  }
}

export default {
  // namespaced: true,
  state,
  getters,
  mutations,
  actions
}
