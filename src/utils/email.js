// 0量子加密，  1聊天， 2加密+聊天, 3加密+阅后即焚, 4加密+阅后即焚+聊天 ,5撤回邮件
export const codeList = ['JeOW0ix7', 'JeOW0ix8', 'JeOW0ix9', 'JeOW0ix0', 'JeOW0ix1', 'JeOW0ix2']

export const getMailCode = (index) => {
  return codeList[index]
}
