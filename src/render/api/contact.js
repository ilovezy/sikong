import {post} from "@/plugins/axios"

export const findFriendApplyByPhone = (data) => post('/addressBook/v2/findFriendApplyByPhone',data)
export const getAddressBookList = (data) => post('/addressBook/v2/getAddressBookList',data)
export const findUserByPhoneOrEmail = (data) => post('/user/v2/findMailUserByPhoneOrMail', data)
export const askForFriend = (data) => post('/addressBook/v2/askForFriend', data)
export const agreeAndAddAddressBook = (data) => post('/addressBook/v2/agreeAndAddAddressBook', data)
export const rejectFriendApply = (data) => post('/addressBook/v2/rejectFriendApply', data)
export const updateFriendNickAfter = (data) => post('/addressBook/v2/updateFriendNickAfter', data)
export const deleteSiKongAddressBook = (data) => post('/addressBook/v2/deleteSiKongAddressBook', data)
