import axiosIns from './axios-ins'
import * as url from './url'

/*
  根据token获取用户信息
 */
export function getByToken (param) {
  return axiosIns.get(url.GET_USER_BY_TOKEN, param)
}

/*
  根据用户ID获取用户信息
 */
export function getByUserID (param) {
  return axiosIns.get(url.GET_USER_BY_ID, param)
}

/*
获取所有用户列表
 */
export function getUserList (json) {
  return axiosIns.get(url.GET_CONTACTS_URL, json)
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
获得最新活动
 */
export function getNewActivity (json) {
  return axiosIns.get(url.GET_NEWACTIVITY_URL, json)
}
