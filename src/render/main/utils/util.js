const fs = require('fs')
const path = require('path')

function getType (name) {
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
function getPathInfo (pathName) {
  let dirs = []
  let files = fs.readdirSync(pathName)
  for (let i = 0; i < files.length; i++) {
    try {
      let data = fs.statSync(path.join(pathName, files[i]))
      let fileInfo = {
        filename: files[i],
        isDirectory: data.isDirectory(),
        label: '文件夹',
        size: data.size,
        mtime: new Date(data.mtime).toLocaleString('chinese', {hour12: false})
      }
      if (data.isFile()) {
        let _obj = getType(files[i])
        Object.assign(fileInfo, _obj)
      }
      dirs.push(fileInfo)
    } catch (err) {
      continue
    }
  }
  return dirs
}

export {
  getPathInfo,
  getType
}
