// 调用APP上传图片
// eslint-disable-next-line no-unused-vars
function appUploadPic (flag) {
  window.appImageObj.showImageDialog(flag)
}
// 调用App上传头像
// eslint-disable-next-line no-unused-vars
function appUploadHeaderImage () {
  window.appHeaderImageObj.showHeaderImageDialog()
}
// 调用APP设置头像或上传图片回调JS方法，需要重写此方法
// eslint-disable-next-line no-unused-vars
var appPicUploadUrl // 返回的图片地址或idinfo
// eslint-disable-next-line no-unused-vars
function uploadAvatarIsCompleted (name, urlInfo) {
  appPicUploadUrl = urlInfo
  alert(urlInfo)
  window.uploadAvatarIsCompleted(urlInfo)
}

// H5跳转到Android Fragment
// eslint-disable-next-line no-unused-vars
function toAndroidActivity (fragement) {
  if (fragement === 'home') { // H5跳转到Android 首页Fragment
    window.toHomeActivity.startHomeIntent()
  } else if (fragement === 'mycenter') { // H5跳转到Android 个人中心Fragment
    window.toMyCenterActivity.startMycenterIntent()
  } else if (fragement === 'mysetting') {
    window.toMySettingActivity.startMySettingIntent()// H5跳转到Android 设置中心Fragment
  } else if (fragement === 'login') {
    window.toLoginActivity.startLoginIntent() // H5跳转到Android 登陆Activity
  }
}

// H5调用Android消息通知
// eslint-disable-next-line no-unused-vars
function sendNotification1 (activeTitle, activeContent, activeImage, activeCreatTime) {
  window.sendNotification1Obj.sendNotification1(activeTitle, activeContent, activeImage, activeCreatTime)
}

export {
  appUploadPic,
  uploadAvatarIsCompleted,
  appPicUploadUrl,
  sendNotification1
}
