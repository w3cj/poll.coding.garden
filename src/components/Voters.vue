<template lang="html">
  <v-layout row wrap>
    <Avatar xs4 v-for="user in voters" :key="user._id" :user="user" />
  </v-layout>
</template>

<script>
import Avatar from '@/components/Avatar';

export default {
  props: ['votes'],
  components: {
    Avatar
  },
  data() {
    return {
      voters: []
    };
  },
  mounted() {
    this.load();
  },
  methods: {
    load() {
      (async () => {
        const result = await this.$services.users.find({
          $in: {
            _id: this.votes.map(v => v.user)
          }
        });
        this.voters = result.data;
      })();
    }
  }
};
</script>

<style lang="css">
</style>
