export const BASE_URL = '/api'
export const IMG_URL = 'http://localhost:8077'
export const REGISTER_USER_URL = '/memberservice/user/register'

// 根据token获得用户信息
export const GET_USER_BY_TOKEN = '/memberservice/member/findByToken'
// 根据用户ID获得用户信息
export const GET_USER_BY_ID = '/memberservice/member/findById'
// 获得用户联系人列表
export const GET_CONTACTS_URL = '/imchartservice/imchartMessage/getContacts'
// 保存用户聊天消息
export const SAVE_MESSAGE_URL = '/imchartservice/imchartMessage/saveMessage'
// 获得用户聊天消息
export const GET_MESSAGE_URL = '/imchartservice/imchartMessage/getMessage/'
// 获得最新活动
export const GET_NEWACTIVITY_URL = '/imchartservice/messagePush/getNewActivity'
