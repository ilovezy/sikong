//  公共方法
 function formatDate(datetime) {

    var dateee = new Date(datetime).toJSON();
    var date = new Date(+new Date(dateee) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')

    return date;
}
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
    return _typeObj
  }
// 排序
function keysort(key, sortType) {
    return function(a, b) {
        return sortType ? ~~(a[key] < b[key]) : ~~(a[key] > b[key])
    }
}
function add0(m){
    return m < 10 ? '0' + m: m
}
// 时间戳转换为所需格式的时间字符串
function dateFormat(timestamp){
    var time = new Date(timestamp)    //先将时间戳转为Date对象，然后才能使用Date的方法
    console.log(time)
    var year = time.getFullYear(),
        month = time.getMonth() + 1 ,  //月份是从0开始的
        day = time.getDate(),
        hour = time.getHours(),
        minute = time.getMinutes(),
        second = time.getSeconds()
        //add0()方法在后面定义
    return  year+'-'+add0(month)+'-'+ add0(day)+' '+add0(hour)+':'+add0(minute)+':'+add0(second)
}
function specialHtml(word) {
    return `这是一封${word}邮件。<br/>iPhone手机用户请从苹果应用商店<a href="https://itunes.apple.com/cn/app//id1450464065?mt=8">https://itunes.apple.com/cn/app//id1450464065?mt=8</a>下载安装“无忧密邮” 查看邮件内容；<br/>安卓手机用 户请从<a href="http://www.qmake.com.cn/down.html">http://www.qmake.com.cn/down.html</a> 下载安装“无忧密邮“查看邮件内容。<br/><font color="#FF0000">----以下是${word}邮件内容----</font><br/><br/>`
}
export {
    formatDate,
    dateFormat,
    keysort,
    specialHtml,
    getType
};