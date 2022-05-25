import {post} from "@/plugins/axios"


export const requireKd = (data) => post('/dataKey/requireKd', data)
export const submitFileKdRelation = (data) => post('/dataKey/submitFileKdRelation', data)
export const requireKdByFileId = (data) => post('/dataKey/requireKdByFileId', data)

export const updateMailInfo = (data) => post('/user/v2/addOrUpdateUserMail', data)

