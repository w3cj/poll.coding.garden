import Vue from 'vue';
import Router from 'vue-router';
import feathers from '@/feathers';
import Home from '@/components/Home';
import Poll from '@/components/Poll';

Vue.use(Router);


const isLoggedIn = (to, from, next) => {
  feathers.authenticate().then(() => {
    next();
  }).catch(() => {
    localStorage.removeItem('feathers-jwt');
    next('/');
  });
};

const redirectToPoll = (to, from, next) => {
  feathers.authenticate().then(() => {
    next('/poll');
  }).catch(() => {
    localStorage.removeItem('feathers-jwt');
    if (to.path !== '/') {
      next('/');
    } else {
      next();
    }
  });
};

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      beforeEnter: redirectToPoll
    },
    {
      path: '/poll',
      name: 'Poll',
      component: Poll,
      beforeEnter: isLoggedIn
    }
  ],
});
