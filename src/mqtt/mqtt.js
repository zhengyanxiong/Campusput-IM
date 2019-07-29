let mqtt = function ($f7, userID, clientID) {
  var host = '192.168.43.73' // TODO MQtt端口
  var port = 61614
  var destination = 'mqttactivity'
  console.log('userID', userID)
  var userIS = userID
  // eslint-disable-next-line no-unused-vars
  let mqtt = null
  function initMqtt ($f7, clientID) {
    console.log('userID', userIS)

    window.client = new Messaging.Client(host, Number(port), clientID)
    // new Messaging.window.Client(host, Number(port), clientID)
    client.connect({
      onSuccess: function () {
        client.subscribe(destination)

        console.log('userID', userIS)
        client.subscribe('MESSAGE' + userIS)
      },
      onFailure: function () {
        $f7.alert('mqtt连接失败，请稍后再试！', '校园拍拍')
      }
    })
    client.onConnectionLost = function (e) { $f7.alert('mqtt连接断开') }
    mqtt = client
  }
  this.getMqtt = function () {
    return mqtt
  }
  initMqtt($f7, clientID)
}
export default mqtt
