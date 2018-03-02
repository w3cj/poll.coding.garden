<template lang="html">
  <v-layout justify-center>
    <v-btn
      dark
      color="red"
      v-if="!loggingIn && !loggedIn && !error"
      @click="showLoginWindow()">
      Login with Google
    </v-btn>
    <h3 v-if="loggingIn && !error">Logging in...</h3>
    <h3 v-if="loggedIn && !error">Logged In!</h3>
    <h3 v-if="error">{{error}}</h3>
  </v-layout>
</template>

<script>
import host from '@/host';

let popup = null;

export default {
  data() {
    return {
      loggingIn: false,
      loggedIn: false,
      error: ''
    };
  },
  mounted() {
    window.addEventListener('message', (message) => {
      if (message.data.token) {
        this.loggingIn = false;
        this.loggedIn = true;
        localStorage['feathers-jwt'] = message.data.token;
        popup.close();
        this.$feathers.authenticate().then(() => {
          this.$router.push('/poll');
        }).catch((error) => {
          localStorage.removeItem('feathers-jwt');
          this.loggingIn = false;
          this.error = error.message;
        });
      } else if (message.data.error) {
        this.loggingIn = false;
        this.error = message.data.error;
      }
    }, false);
  },
  methods: {
    showLoginWindow() {
      const width = 1024;
      const height = 640;
      const left = window.screenX + ((window.outerWidth - width) / 2);
      const top = window.screenY + ((window.outerHeight - height) / 2);
      const params = `width=${width}, height=${height}, top=${top}, left=${left}`;
      popup = window.open(`${host}/auth/google`, 'authWindow', params);
    }
  }
};
</script>

<style lang="css">
</style>
