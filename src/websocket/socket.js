let socket = function ($f7, token) {
  let url = 'ws://192.168.1.6:8082/'
  let ws = null
  function initWs ($f7, token) {
    if (window['WebSocket']) {
      ws = new WebSocket(url + token)
    } else {
      $f7.alert('不支持websocket通信，请联系管理员！', '校园拍拍')
    }
  }
  this.getWebSocket = function () {
    return ws
  }
  initWs($f7, token)
}
export default socket
