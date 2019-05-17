<template>
  <f7-views id="app">
    <f7-view id="main-view" main>
      <f7-pages>
        <f7-page toolbar-fixed navbar-fixed>
          <f7-navbar :title="activeTab">
            <f7-nav-right>
              <f7-link><i class="f7-icons bell">bell_fill</i></f7-link>
            </f7-nav-right>
          </f7-navbar>
          <f7-list media-list>
            <f7-list-item :media="getActiveNoticeMedia(1)"
                          :title="getActiveNoticeTitle(1)"
                          :subtitle="getActiveNoticeSubtitle(1)"
                          :text="getActiveNoticeTime(1)">
            </f7-list-item>
          </f7-list>

          <f7-list media-list contacts>

            <f7-list-group v-for="(group) in contacts">
              <f7-list-item v-for="item in group"
                          :media="getContactsMedia(item.headImag)"
                          :title="getContactsTitle(item.username)"
                          :subtitle="getContactsSubtitle(1)"
                          :link="toMessage()"
                          @click="setChatUser(item)">
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
import {getByToken, getUserList} from './api/api'
import {isEmpty} from '@/util/utils'
import {mapState} from 'vuex'
import {groupBy} from 'lodash'

export default {
  data () {
    return {
      activeTab: '消息中心',
      contacts: []
    }
  },
  computed: {
    ...mapState({
      user: state => state.user,
      websocket: state => state.websocket
    })
  },
  mounted () {
    this.$nextTick(() => {
      this.$f7.showIndicator()
      if (isEmpty(Cookies.get('token'))) {
        this.$f7.hideIndicator()
        this.$f7.alert('请登陆', null)
      } else {
        axiosIns.defaults.headers.common['token'] = Cookies.get('Authorization')
        // eslint-disable-next-line no-unused-vars
        let param = {
          params: {
            token: Cookies.get('token')
          }
        }
        getByToken(param).then(data => {
          this.$f7.hideIndicator()
          if (data.code === 200) {
            let user = data.data
            this.$store.dispatch('initUser', user)
            this.initApp()
          } else {
            this.$f7.alert('用户未登陆，请登陆', null)
          }
        })
      }
    })
  },
  methods: {
    initApp () {
      // eslint-disable-next-line new-cap
      let soc = new socket(this.$f7, Cookies.get('token'))
      let webSocket = soc.getWebSocket()
      webSocket.onopen = function () {
        console.log('webscoket连接')
      }
      webSocket.onerror = function () {
        this.$f7.alert('连接通讯服务器失败，请重新登录或者联系管理员', null)
      }
      this.$store.dispatch('initWebsocket', webSocket)
      this.getContacts()
    },
    getContacts () { // 获得用户通讯录
      this.$f7.showIndicator()
      // eslint-disable-next-line no-unused-vars
      let param = {
        params: {
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
          this.contacts = groupBy(data.data.list, 'header')
        } else {
          this.$f7.alert(data.msg, '校园拍拍')
        }
      })
    },
    getActiveNoticeMedia (item) {
      return "<img src='http://47.107.228.169:8099/15/1/ceb19410f3724e5ab63d7a13340ce2f0.jpg' width='44'/>"
    },
    getActiveNoticeTitle (item) {
      return "<div class='item-title list-title-text'>通知助手</div>"
    },
    getActiveNoticeSubtitle (item) {
      return "<div class='item-subtitle list-item-context'>学霸都在读什么书？</div>"
    },
    getActiveNoticeTime (item) {
      return "<div class='item-subtitle list-item-context'>21小时之前</div>"
    },
    getContactsMedia (item) {
      return "<img src='" + item + "' width='44'/>"
    },
    getContactsTitle (item) {
      return "<div class='item-title list-title-text'>" + item + " <div class='list-tile-time'>11:21</div></div> "
    },
    getContactsSubtitle (item) {
      return "<div class='item-subtitle list-item-context'>学霸都在读什么书？</div>"
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
