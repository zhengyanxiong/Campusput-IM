<template>
  <f7-views id="app">
    <f7-view id="main-view" main>
      <f7-pages>
        <f7-page toolbar-fixed navbar-fixed>
          <f7-navbar :title="activeTab">
          </f7-navbar>
          <!--<f7-list media-list>
            <f7-list-item :media="getActiveNoticeMedia(1)"
                          :title="getActiveNoticeTitle(1)"
                          subtitle="<div class='item-subtitle list-item-context'>{{activeTitle}}</div>"
                          :text="getActiveNoticeTime(1)">
            </f7-list-item>
          </f7-list>-->
          <div class="card-content">
            <div class="list-block media-list">
              <ul>
                <li class="item-content">
                  <div class="item-media">
                    <img :src="activeImage" width="44">
                  </div>
                  <div class="item-inner">
                    <div class="item-title-row">
                      <div class='item-title list-title-text'>通知助手</div>
                      <f7-badge color="red" v-show="activeCountShow">{{activeCount}}</f7-badge>
                    </div>
                    <div class='item-subtitle list-item-context'>{{activeTitle}} {{ activeContent}}</div>
                    <div class='item-subtitle list-item-context'>{{activeCreatTime}}</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <f7-list media-list contacts>
            <f7-list-group v-for="group in contacts">
              <f7-list-item v-for="item in group"
                            :media="getContactsMedia(item.user.headImag)"
                            :title="getContactsTitle(item.user.username == null ? item.user.studentId : item.user.username)"
                            :subtitle="getContactsSubtitle(item.schoolName == null ? '该用户暂未认证学校' : item.schoolName)"
                            :link="toMessage()"
                            @click="setChatUser(item.user)">
              </f7-list-item>
            </f7-list-group>
          </f7-list>

        </f7-page>
      </f7-pages>
    </f7-view>

  </f7-views>
</template>

<script>
import Cookies from 'cookies-js'
import axiosIns from './api/axios-ins'
import socket from './websocket/socket'
import mqtt from './mqtt/mqtt'
import {getByToken, getByUserID, getUserList, getNewActivity} from './api/api'
import {isEmpty, getQueryString} from '@/util/utils'
// eslint-disable-next-line no-unused-vars
import {sendNotification1} from './util/app'
import {mapState} from 'vuex'
import {groupBy} from 'lodash'

export default {
  data () {
    return {
      activeTab: '消息中心',
      contacts: [],
      activeContent: '',
      activeDate: '',
      activeTitle: '',
      activeCount: null,
      activeCountShow: false,
      activeCreatTime: '',
      activeImage: require('./assets/notice.png'),
      androidUserId: null
    }
  },
  computed: {
    ...mapState({
      user: state => state.user,
      websocket: state => state.websocket,
      mqtt: state => state.mqtt
    })
  },
  mounted () {
    let _self = this
    window.jumpToPage = _self.jumpToPage
    _self.$nextTick(() => {
      _self.$f7.showIndicator()
      if (isEmpty(Cookies.get('app_member_token'))) {
        _self.$f7.hideIndicator()
        _self.$f7.alert('请登陆', null)
      } else {
        axiosIns.defaults.headers.common['token'] = Cookies.get('Authorization')
        // eslint-disable-next-line no-unused-vars
        let param = {
          params: {
            token: Cookies.get('app_member_token')
          }
        }
        getByToken(param).then(data => {
          _self.$f7.hideIndicator()
          if (data.code === 200) {
            let user = data.data
            _self.$store.dispatch('initUser', user)
            _self.initApp()
          } else {
            _self.$f7.alert('用户未登陆，请登陆', null)
          }
        })
      }
    })
  },
  methods: {
    initApp () {
      // eslint-disable-next-line new-cap
      let soc = new socket(this.$f7, Cookies.get('app_member_token'))
      let webSocket = soc.getWebSocket()
      webSocket.onopen = function () {
        console.log('webscoket连接')
      }
      webSocket.onerror = function () {
        this.$f7.alert('连接通讯服务器失败，请重新登录或者联系管理员', null)
      }

      // 判断地址栏是否带参，带参则直接跳转到聊天页面
      if (!isEmpty(getQueryString('sellerID'))) {
        // eslint-disable-next-line no-unused-vars
        let param = {
          params: {
            id: getQueryString('sellerID')
          }
        }
        getByUserID(param).then(data => {
          if (data.code === 200) {
            let user = data.data.user
            this.$store.dispatch('initChatUser', user)
            this.$f7.views.main.router.load({url: '/message'})
          }
        })
      }

      // Mqtt 连接
      let dtate = new Date()
      console.log('this.user.userId', this.user.userId)

      let fUserID = this.user.userId
      // eslint-disable-next-line new-cap,camelcase
      let mqtt_client = new mqtt(this.$f7, fUserID, 'MESSAGE' + fUserID + dtate.getDay() + dtate.getTime())
      let mqttClinet = mqtt_client.getMqtt()
      mqttClinet.onMessageArrived = (e) => {
        console.log('Mqtt接收的消息', e.payloadString)
        let mqMessage = JSON.parse(e.payloadString)
        let Base64 = require('js-base64').Base64
        console.log('mqMessage', mqMessage)
        this.activeTitle = Base64.decode(mqMessage.title)
        this.activeContent = Base64.decode(mqMessage.content)
        this.activeImage = isEmpty(mqMessage.activeImage) ? require('./assets/notice.png') : mqMessage.activeImage
        this.activeDate = mqMessage.activeDate
        this.activeCount = this.activeCount + 1
        this.activeCountShow = true
        this.activeCreatTime = this.getDateDiff(mqMessage.activeCreatTime, new Date(), 1)
        sendNotification1(this.activeTitle, this.activeContent, this.activeImage, this.activeCreatTime)
        console.log('this.activeTitle', this.activeTitle)
      }

      this.$store.dispatch('initWebsocket', webSocket)
      this.$store.dispatch('initMqtt', mqttClinet)
      this.getNewActivity()
      this.getContacts()

      if (!isEmpty(this.androidUserId)) {
        window.location.href = 'http://192.168.43.73:9999?sellerID=' + this.androidUserId // TODO 设置聊天地址页面
      }
    },
    jumpToPage (userID) {
      console.log('接收到的用户ID是：' + userID)
      this.androidUserId = userID
    },
    getContacts () { // 获得用户通讯录
      this.$f7.showIndicator()
      // eslint-disable-next-line no-unused-vars
      let param = {
        params: {
          userId: this.user.userId,
          param: null,
          pageInfo: {
            pageNum: 1,
            pageSize: 200
          }
        }
      }
      getUserList(param).then(data => {
        if (data.code === 200) {
          this.$f7.hideIndicator()
          this.contacts = groupBy(data.data, 'header')
        } else {
          this.$f7.alert(data.msg, '校园拍拍')
        }
      })
    },
    getNewActivity () { // 获得最新活动信息
      // eslint-disable-next-line no-extend-native
      Date.prototype.format = function (fmt) {
        var o = {
          'M+': this.getMonth() + 1, // 月份
          'd+': this.getDate(), // 日
          'h+': this.getHours(), // 小时
          'm+': this.getMinutes(), // 分
          's+': this.getSeconds(), // 秒
          'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
          'S': this.getMilliseconds() // 毫秒
        }
        if (/(y+)/.test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
        }
        for (var k in o) {
          if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
          }
        }
        return fmt
      }

      getNewActivity().then(data => {
        if (data.code === 200) {
          this.activeTitle = data.data.activeName
          this.activeContent = data.data.activeDescription
          this.activeImage = data.data.activeUrl
          let ast = new Date(data.data.activeStartTime).format('yyyy-MM-dd hh:mm:ss')
          let aed = new Date(data.data.activeEndTime).format('yyyy-MM-dd hh:mm:ss')
          let apt = new Date(data.data.activePublishTime).format('yyyy-MM-dd hh:mm:ss')
          this.activeDate = ast + '--' + aed
          this.activeCountShow = false
          this.activeCreatTime = this.getDateDiff(apt, new Date(), 1)
        } else {
          this.$f7.alert(data.msg, '校园拍拍')
        }
      })
    },
    getDateDiff (starttime, endtime, type) {
      if (starttime == null || endtime == null) {
        return ''
      }
      var ed = endtime
      var sd = starttime
      if (type === 1) {
        ed = ed + ':00'
      } else if (type === 2) {
        sd = sd + ':00'
      }
      var startTime = new Date(sd)
      var endTime = new Date(ed)
      // eslint-disable-next-line no-unused-vars
      var result = ''

      var date3 = endTime.getTime() - startTime.getTime() // 时间差的毫秒数

      // 计算出相差天数
      var days = Math.floor(date3 / (24 * 3600 * 1000))

      result += days > 0 ? days : '0'
      if (days > 0) {
        return days + ' 天前'
      }
      // 计算出小时数
      var leave1 = date3 % (24 * 3600 * 1000) // 计算天数后剩余的毫秒数
      var hours = Math.floor(leave1 / (3600 * 1000))

      result += hours > 0 ? hours : '0'
      if (hours > 0) {
        return hours + ' 小时前'
      }

      // 计算相差分钟数
      var leave2 = leave1 % (3600 * 1000) // 计算小时数后剩余的毫秒数
      var minutes = Math.floor(leave2 / (60 * 1000))

      result += minutes > 0 ? minutes : '0'
      if (minutes > 0) {
        return days + ' 分钟前'
      }

      // 计算相差秒数
      var leave3 = leave2 % (60 * 1000) // 计算分钟数后剩余的毫秒数
      var seconds = Math.round(leave3 / 1000)

      console.log(result)
      return seconds > 0 ? seconds + ' 秒前' : '刚刚'
    },
    getContactsMedia (item) {
      return '<img src=\'' + item + '\' width=\'44\'/>'
    },
    getContactsTitle (item) {
      return '<div class=\'item-title list-title-text\'>' + item + ' </div> '
    },
    getContactsSubtitle (item) {
      return '<div class=\'item-subtitle list-item-context\'> ' + item + '</div>'
    },
    toMessage () {
      return '/message'
    },
    setChatUser (item) {
      this.$store.dispatch('initChatUser', item)
    }
  }
}
</script>

<style>
  @import "../static/App.css";
</style>
