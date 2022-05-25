// size格式化
export function getfilesize (size) {
  if (!size) return ''
  var num = 1024.00
  if (size < num) {
    return size + 'B'
  } else if (size < Math.pow(num, 2)) {
    return (size / num).toFixed(2) + 'K'
  } else if (size < Math.pow(num, 3)) {
    return (size / Math.pow(num, 2)).toFixed(2) + 'M'
  } else if (size < Math.pow(num, 4)) {
    return (size / Math.pow(num, 3)).toFixed(2) + 'G'
  } else {
    return (size / Math.pow(num, 4)).toFixed(2) + 'T'
  }
}
// 判断文件类型
export function getType (name) {
  let _type = name.substring(name.lastIndexOf('.') + 1, name.length)
  let _typeObj = {}
  let _txtType = ['txt']
  let _pdfType = ['pdf']
  let _imgType = ['jpg', 'jpeg', 'png', 'gif']
  let _videoType = ['mp4', 'flv', 'avi', 'mov', 'asf', 'qt', 'mpg', 'mpeg', 'rm', 'rmvb']
  let _musicType = ['mp3', 'wma', 'mkv', 'wav', 'bmp']
  let _wordType = ['doc', 'docx']
  let _pptType = ['ppt', 'pptx']
  let _excelType = ['xls', 'xlsx']

  if (_txtType.includes(_type)) {
    _typeObj.isTxt = true
    _typeObj.label = '文本'
  } else if (_pdfType.includes(_type)) {
    _typeObj.isPdf = true
    _typeObj.label = 'PDF文件'
  } else if (_imgType.includes(_type)) {
    _typeObj.isImg = true
    _typeObj.label = '图片'
  } else if (_videoType.includes(_type)) {
    _typeObj.isVideo = true
    _typeObj.label = '视频文件'
  } else if (_musicType.includes(_type)) {
    _typeObj.isMusic = true
    _typeObj.label = '音频文件'
  } else if (_wordType.includes(_type)) {
    _typeObj.isWord = true
    _typeObj.label = 'Word文件'
  } else if (_pptType.includes(_type)) {
    _typeObj.isPPT = true
    _typeObj.label = 'PPT文件'
  } else if (_excelType.includes(_type)) {
    _typeObj.isExcel = true
    _typeObj.label = 'Excel文件'
  } else {
    _typeObj.isOther = true
    _typeObj.label = '文件'
  }

  if (name.includes('.wymc')) {
    _typeObj.isEncrypted = true
    _typeObj.label = '密存加密后文件'
  }
  return _typeObj
}
/**
 * 生成32位唯一标识guid
 */
export function genID () {
  var d = new Date().getTime()
  var uuid = 'xxxxxxxxxxxx4xxxxxyxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
  return uuid
}
