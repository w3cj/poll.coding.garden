<template lang="html">
  <span class="avatar-name">
    <v-avatar size="36px">
      <img :src="user.image || './static/user.png'">
    </v-avatar>
    <small>{{user.display_name}}</small>
  </span>
</template>

<script>
export default {
  props: ['user']
};
</script>

<style lang="css">
.avatar-name {
  display: inline-flex;
  flex-direction:column;
  align-items: center;
}
</style>
