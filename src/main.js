// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';

import Loading from '@/components/Loading';

import App from './App';
import router from './router';
import feathers from './feathers';
import services from './services';

Vue.config.productionTip = false;

Vue.use(Vuetify);

Vue.mixin({
  created() {
    this.$feathers = feathers;
    this.$services = services;
  }
});

Vue.component('Loading', Loading);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
});
