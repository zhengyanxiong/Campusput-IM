import Vue from 'vue'
import App from './App'
import router from './router'
import 'framework7'
import Framework7Vue from 'framework7-vue'
import store from './store/store'
import message from './components/Message.vue'
import 'framework7/dist/css/framework7.ios.min.css'
import 'framework7/dist/css/framework7.ios.colors.min.css'
import 'framework7-icons/css/framework7-icons.css'

Vue.use(Framework7Vue)
Vue.component('message-pop', message)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>',
  store,
  framework7: {
    root: '#app',
    routes: router
  }
})
