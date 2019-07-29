let socket = function ($f7, token) {
  let url = 'ws://192.168.43.73:8082/' // TODO websocket连接端口
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
