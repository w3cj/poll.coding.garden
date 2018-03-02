<template>
  <v-app id="inspire" dark>
    <v-toolbar app fixed clipped-left>
      <v-toolbar-title>Coding Garden Video Poll</v-toolbar-title>
    </v-toolbar>
    <v-content>
      <v-container fluid>
        <v-layout>
          <Loading v-if="loading" />
          <router-view v-if="!loading" :user="user"/>
        </v-layout>
      </v-container>
    </v-content>
    <v-footer app fixed>
      <span class="ma-5">Made with 💜 by CJ - &copy; 2018</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      loading: true,
      loggedIn: false,
      user: null
    };
  },
  mounted() {
    this.$feathers.authenticate().catch(() => this.loading = false);

    this.$feathers.on('authenticated', (data) => {
      this.loading = true;
      this.$feathers.passport.verifyJWT(data.accessToken)
        .then(payload => this.$feathers.service('users').get(payload.userId))
        .then((user) => {
          this.user = user;
          this.loggedIn = true;
          this.loading = false;
        });
    });

    this.$feathers.on('reauthentication-error', () => {
      this.$feathers.logout();
    });

    this.$feathers.on('logout', () => {
      this.user = null;
      this.loggedIn = false;
      this.loading = false;
      this.$router.push('/');
    });
  }
};
</script>

<style>
</style>
