import axiosIns from './axios-ins'
import * as url from './url'

/*
  根据token获取用户信息
 */
export function getByToken (param) {
  return axiosIns.get(url.GET_USER_BY_TOKEN, param)
}

/*
获取所有用户列表
 */
export function getUserList (json) {
  return axiosIns.get(url.GET_CONTACTS_URL, json)
}

/*
更新用户信息
 */
export function updateUser (json) {
  return axiosIns.post(url.UPDATE_USER_URL, json)
}

/*
保存聊天记录
 */
export function saveMessage (json) {
  return axiosIns.post(url.SAVE_MESSAGE_URL, json)
}

/*
获取聊天记录
 */
export function getMessage (fromUserId, toUserId, date, json) {
  return axiosIns.post(url.GET_MESSAGE_URL + fromUserId + '/' + toUserId + '/' + date, json)
}

/*
上传软文图片
 */
export function uploadEssayImg (imgType, md5, data) {
  return axiosIns.post(url.UPLOAD_ESSAY_IMG + imgType + '/' + md5, data)
}

/*
上传消息图片
 */
export function uploadMessageImg (imgType, md5, data) {
  return axiosIns.post(url.UPLOAD_MESSAGE_IMG + imgType + '/' + md5, data)
}
