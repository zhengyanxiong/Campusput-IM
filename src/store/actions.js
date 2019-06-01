import * as types from './mutations-types'

export function initUser ({commit}, user) {
  commit(types.INIT_USER, user)
}
export function initChatUser ({commit}, chatUser) {
  commit(types.INIT_CHAT_USER, chatUser)
}
export function initWebsocket ({commit}, websocket) {
  commit(types.INIT_WEBSOCKET, websocket)
}
export function initMqtt ({commit}, mqtt) {
  commit(types.INIT_MQTT, mqtt)
}
export function initUserinfo ({commit}, userinfo) {
  commit(types.INIT_USERINFO, userinfo)
}
