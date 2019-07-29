<template>
  <f7-page pull-to-refresh @ptr:refresh="onRefresh" toolbar-fixed navbar-fixed>
    <audio id="audio" preload="auto" controls loop v-show="true" style="width: 0px;height: 0px;">
      <source src="../assets/634.wav" type="audio/ogg" v-show="true"/>
    </audio>
    <f7-navbar :title="chatUser.username == null ? chatUser.studentId : chatUser.username" back-link="返回" sliding @click="backHome"></f7-navbar>

    <f7-messages :init="true" :scrollMessages="scrollAuto" ref="f7messages">
    </f7-messages>

    <f7-toolbar class="messagebar">
      <div class="toolbar-inner">
        <f7-link @click="openImg">
          <i class="f7-icons">camera</i>
        </f7-link>
        <textarea placeholder="Message" v-model="content" style="width: 70%;"></textarea>
        <a href="#" class="send" @click="onSubmit">发送</a>
        <input id="uploadImg" type="file" accept="image/*" @change="uploadMessageImg" hidden/>
      </div>
    </f7-toolbar>
    <!--<f7-messagebar placeholder="Message" send-link="Send" @submit="onSubmit"></f7-messagebar>-->

  </f7-page>
</template>

<script>
import {mapState} from 'vuex'
// eslint-disable-next-line no-unused-vars
import {appUploadPic, appPicUploadUrl, sendNotification1} from '../util/app'
import singleChat from '../websocket/msgObj'
import {saveMessage, getMessage} from '../api/api'
import {isEmpty, formatDate, getQueryString} from '../util/utils'
import forEach from 'lodash/forEach'
import $ from 'jquery'
export default {
  name: 'Message',
  computed: {
    ...mapState({
      chatUser: state => state.chatUser,
      websocket: state => state.websocket,
      user: state => state.user
    })
  },
  data () {
    return {
      flag: false,
      pageNum: 1,
      pages: null,
      scrollAuto: true,
      content: '',
      messages: [],
      uploadImgUrl: '',
      photoBrowserCount: 0,
      currentTime: '',
      lastRunTime: '',
      isPlaying: false
    }
  },
  mounted () {
    var _self = this
    window.uploadAvatarIsCompleted = _self.uploadAvatarIsCompleted
    this.websocket.onmessage = function (event) {
      console.log('接收到websocket的内容：', event)
      var result = JSON.parse(event.data)
      if (result.code === 100) {
        _self.$f7.hideIndicator()
        result = result.data
        let obj = JSON.parse(result)
        _self.scrollAuto = true
        if (obj.msgType === 1) {
          _self.messages.push(_self.generateMessage(obj.message, _self.user, 'sent'))
          _self.$refs.f7messages.appendMessage(_self.generateMessage(obj.message, _self.user, 'sent'))
        } else {
          // 图片
          _self.messages.push(_self.generateMessage('', _self.user, 'sent'))
          _self.$refs.f7messages.appendMessage(_self.generateImgMessage("<img src='" + obj.smallImg + "'  class='message-img'>", _self.user, 'sent'))
          $('.message-img').click(() => {
            _self.onMessageClick(obj.message)
          })
        }
      } else if (result.code === 101) {
        // 接收到消息
        let message = result.data
        let content = message.message
        /* let nowDate = (function () {
          let now = new Date()
          let hours = now.getHours()
          let minutes = now.getMinutes()
          let second = now.getSeconds()
          return hours + ':' + minutes + ':' + second
        })()
        sendNotification1(_self.chatUser.username, content, _self.chatUser.headImag, nowDate) */
        _self.play()
        _self.scrollAuto = true
        if (message.msgType === 1) {
          _self.$refs.f7messages.appendMessage(_self.generateMessage(content, _self.chatUser, 'received'))
          _self.messages.push(_self.generateMessage(content, _self.chatUser, 'received'))
        } else {
          // 图片
          _self.messages.push(_self.generateMessage('', _self.chatUser, 'received'))
          _self.$refs.f7messages.appendMessage(_self.generateImgMessage("<img src='" + message.smallImg + "'  class='message-img'>", _self.chatUser, 'received'))
          $('.message-img').click(() => {
            _self.onMessageClick(message.message)
          })
        }
      } else {
        _self.$f7.alert(null, '发送消息失败')
      }
    }
    // 获取双方聊天记录
    this.getBothMessage(new Date(), 0)
  },
  methods: {
    openImg () {
      /* document.getElementById('uploadImg').click() */
      appUploadPic('rr')
    },
    uploadAvatarIsCompleted (url) {
      console.log('ss接收到的图片：' + url)
      this.uploadImgUrl = url
      this.content = url
      this.onSubmit('img')
    },
    uploadMessageImg (evnet) {
      let _self = this
      _self.$f7.alert('照片')
    },
    onRefresh () {
      let length = this.messages.length
      if (length > 0) {
        if (this.pageNum < this.pages) {
          this.pageNum++
          let date = this.messages[length - 1].date
          this.getBothMessage(new Date(date), 1)
        } else {
          this.$f7.pullToRefreshDone()
        }
      }
    },
    onSubmit (type) {
      if (isEmpty(this.content)) {
        this.$f7.alert(null, '不能发送空内容')
        return
      }
      console.log('this value', this)
      if (this.chatUser.userId === this.user.userId) {
        // 自己的聊天窗口
        if (type === 'img') {
          this.$refs.f7messages.appendMessage(this.generateImgMessage("<img src='" + this.uploadImgUrl + "' class='message-img'>", this.user, 'sent'))
          var _self = this
          $('.message-img').click(() => {
            _self.onMessageClick(this.uploadImgUrl)
          })
        } else {
          this.$refs.f7messages.appendMessage(this.generateMessage(this.content, this.user, 'sent'))
        }
      } else {
        // 先保存到数据库
        var obj = null
        if (type === 'img') {
          // eslint-disable-next-line new-cap
          obj = new singleChat(
            2, this.uploadImgUrl, this.user.userId, this.chatUser.userId, this.content
          )
        } else {
          // eslint-disable-next-line new-cap
          obj = new singleChat(
            1, this.content, this.user.userId, this.chatUser.userId, null
          )
        }
        console.log('发送的数据：', obj)
        var json = JSON.stringify(obj)
        this.$f7.showIndicator()
        saveMessage(json).then(data => {
          if (data.code === 200) {
            this.websocket.send(json)
          } else {
            this.$f7.alert(data.msg, null)
          }
        })
      }
      this.content = ''
    },
    generateMessage (text, user, type, date) {
      return {
        name: user.username,
        avatar: user.headImag,
        text,
        type,
        date: isEmpty(date) ? (function () {
          let now = new Date()
          let years = now.getFullYear()
          let month = now.getMonth() + 1
          let day = now.getDate()
          let hours = now.getHours()
          let minutes = now.getMinutes()
          let second = now.getSeconds()
          return years + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + second
        })() : date
      }
    },
    generateImgMessage (text, user, type, date) {
      return {
        name: user.username,
        avatar: user.headImag,
        text,
        type
      }
    },
    getBothMessage (time, type) {
      getMessage(this.user.userId, this.chatUser.userId, time, JSON.stringify({
        pageNum: this.pageNum,
        pageSize: 10
      })).then(data => {
        if (data.code === 200) {
          data = data.data
          this.pages = data.pages
          var _self = this
          if (data.list.length > 0) {
            if (type === 0) {
              _self.scrollAuto = true
              forEach(data.list, (n) => {
                if (n.msgType === 1) {
                  if (n.fromUserId === _self.user.userId) {
                    _self.$refs.f7messages.prependMessage(_self.generateMessage(n.message, _self.user, 'sent', _self.formatDate(n.createTime)))
                    _self.messages.push(_self.generateMessage(n.message, _self.user, 'sent', n.createTime))
                  } else {
                    _self.$refs.f7messages.prependMessage(_self.generateMessage(n.message, _self.chatUser, 'received', _self.formatDate(n.createTime)))
                    _self.messages.push(_self.generateMessage(n.message, _self.chatUser, 'received', n.createTime))
                  }
                } else {
                  // 图片
                  if (n.fromUserId === _self.user.userId) {
                    _self.messages.push(_self.generateMessage('', _self.user, 'sent', n.createTime))
                    _self.$refs.f7messages.prependMessage(_self.generateImgMessage("<img src='" + n.smallImg + "'  class='message-img'>", _self.user, 'sent'))
                    $('.message-img').click(() => {
                      _self.onMessageClick(n.message)
                    })
                  } else {
                    _self.messages.push(_self.generateMessage('', _self.chatUser, 'received', n.createTime))
                    _self.$refs.f7messages.prependMessage(_self.generateImgMessage("<img src='" + n.smallImg + "'  class='message-img'>", _self.chatUser, 'received'))
                    $('.message-img').click(() => {
                      _self.onMessageClick(n.message)
                    })
                  }
                }
              })
              _self.messages.reverse()
            } else {
              _self.scrollAuto = false
              forEach(data.list, (n) => {
                if (n.msgType === 1) {
                  if (n.fromUserId === _self.user.userId) {
                    _self.$refs.f7messages.prependMessage(_self.generateMessage(n.message, _self.user, 'sent', _self.formatDate(n.createTime)))
                    _self.messages.unshift(_self.generateMessage(n.message, _self.user, 'sent', n.createTime))
                  } else {
                    _self.$refs.f7messages.prependMessage(_self.generateMessage(n.message, _self.chatUser, 'received', _self.formatDate(n.createTime)))
                    _self.messages.unshift(_self.generateMessage(n.message, _self.chatUser, 'received', n.createTime))
                  }
                } else {
                  // 图片
                  if (n.fromUserId === _self.user.userId) {
                    _self.messages.unshift(_self.generateMessage('', _self.user, 'sent', n.createTime))
                    _self.$refs.f7messages.prependMessage(_self.generateImgMessage("<img src='" + n.smallImg + "'  class='message-img'>", _self.user, 'sent'))
                    $('.message-img').click(() => {
                      _self.onMessageClick(n.message)
                    })
                  } else {
                    _self.messages.unshift(_self.generateMessage('', _self.chatUser, 'received', n.createTime))
                    _self.$refs.f7messages.prependMessage(_self.generateImgMessage("<img src='" + n.smallImg + "'  class='message-img'>", _self.chatUser, 'received'))
                    $('.message-img').click(() => {
                      _self.onMessageClick(n.message)
                    })
                  }
                }
              })
            }
          }
          this.$f7.pullToRefreshDone()
        } else {
          this.$f7.alert('获取聊天记录失败', null)
        }
      })
    },
    onMessageClick (url) {
      var _self = this
      if (this.photoBrowserCount === 0) {
        var photoBrowser = this.$f7.photoBrowser({
          zoom: 400,
          theme: 'dark',
          swipeToClose: true,
          lazyLoading: true,
          photos: [url],
          onClose () {
            _self.photoBrowserCount = 0
          },
          onSwipeToClose () {
            _self.photoBrowserCount = 0
          }
        })
        photoBrowser.open()
        this.photoBrowserCount = 1
      }
    },
    formatDate (time) {
      var date = new Date(time)
      return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
    },
    play () {
      this.lastRunTime = Date.now()
      let audio = document.querySelector('#audio')
      if (!this.isPlaying) {
        audio.play()
        this.isPlaying = true
      }
      let timeOut = setTimeout(() => {
        this.stop(timeOut)
      }, 10000)
    },
    stop (timeOut) {
      this.currentTime = Date.now()
      let audio = document.querySelector('#audio')
      if (this.currentTime - this.lastRunTime < 10000) {
      } else {
        if (this.isPlaying) {
          audio.currentTime = 0
          audio.pause()
          this.isPlaying = false
        }
      }
      clearTimeout(timeOut)
    },
    backHome () {
      if (!isEmpty(getQueryString('sellerID'))) {
        window.location.href = 'http://192.168.43.73:9999' // TODO 设置聊天地址页面
      }
    }
  },
  filters: {
    formatDates (time) {
      return this.formatDate(time)
    }
  }
}
</script>

<style>
  .message-img{
    width: 150px !important;
  }
</style>
