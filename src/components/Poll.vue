<template>
  <v-container>
    <Loading v-if="loading"/>
     <v-layout row wrap v-if="!loading">
       <v-flex class="text-xs-center" xs12>
         <h1 class="display-3">{{question.text}}</h1>
       </v-flex>
       <v-flex class="text-xs-center" xs12>
         <v-btn large color="purple" @click.stop="suggestDialog = !suggestDialog">
           Suggest a video
           <v-icon dark>add</v-icon>
         </v-btn>
       </v-flex>
       <v-flex xs12>
         <v-text-field
           label="Filter"
           v-model="search"></v-text-field>
       </v-flex>
       <v-flex xs12 v-for="(option, index) in filteredOptions" :key="option._id">
         <v-card :color="index % 2 == 0 ? 'cyan darken-2' : 'purple'" class="white--text">
           <v-card-title primary-title>
             <v-layout row wrap>
               <v-flex xs9>
                 <div class="display-1">{{option.text}}</div>
               </v-flex>
               <v-flex xs3 class="text-xs-center">
                 <v-btn icon class="display-3" @click.stop="vote(option._id)">
                   <span :class="{
                      'pink--text text--lighten-2': userVotes[option._id]
                     }">
                     {{votesByOption[option._id].length}}
                     <v-icon class="display-3">favorite</v-icon>
                   </span>
                  </v-btn>
               </v-flex>
               <v-flex xs12 class="mt-3">
                 <small class="subheading">requested by</small>
                 <Avatar :user="users[option.user]" />
                 <small class="body-2">{{formatDate(option.createdAt)}}</small>
               </v-flex>
               <v-chip
                  v-if="userVotes[option._id]"
                  color="pink lighten-2" text-color="white">
                 <v-avatar>
                   <v-icon>check_circle</v-icon>
                 </v-avatar>
                 Voted
               </v-chip>
               <v-btn v-if="option.user == user._id" color="secondary" @click="archive(option)">
                 Archive
               </v-btn>
             </v-layout>
            </v-card-title>
         </v-card>
       </v-flex>
     </v-layout>
     <v-dialog v-model="suggestDialog" max-width="70vw" persistent>
        <v-card>
          <v-card-title>
            Suggest a Video
          </v-card-title>
          <v-card-text class="text-xs-center">
            <v-progress-circular
              v-if="addingSuggestion"
              indeterminate
              :size="70"
              :width="7"
              color="purple"></v-progress-circular>
            <v-text-field
              v-if="!addingSuggestion"
              label="Suggestion"
              v-model="suggestion"
              color="purple"
              required></v-text-field>
          </v-card-text>
          <v-card-actions v-if="!addingSuggestion">
            <v-btn color="cyan darken-2" @click.stop="suggestDialog=false">Cancel</v-btn>
            <v-btn color="purple" @click.stop="addSuggestion()">Add Suggestion</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
   </v-container>
</template>

<script>
import timeago from 'timeago.js';
import Avatar from '@/components/Avatar';
import Voters from '@/components/Voters';

export default {
  props: ['user'],
  components: {
    Avatar,
    Voters
  },
  data() {
    return {
      loading: true,
      search: '',
      suggestion: '',
      addingSuggestion: false,
      suggestDialog: false,
      question: {},
      options: [],
      votesByOption: {},
      users: {},
      userVotes: {},
      loadingUser: {
        display_name: 'Loading...',
        image: ''
      }
    };
  },
  computed: {
    filteredOptions() {
      if (this.search.trim()) {
        const regexp = new RegExp(this.search, 'gi');
        return this.options.filter(option => option.text.match(regexp));
      }

      return this.options;
    }
  },
  mounted() {
    this.load();
    this.listen();
  },
  methods: {
    async archive(option) {
      await this.$services.questionOptions.patch(option._id, {
        archived: true
      });
    },
    formatDate(date) {
      return timeago().format(date);
    },
    vote(option) {
      (async () => {
        if (this.userVotes[option]) {
          await this.$services.optionVotes.remove({
            _id: this.userVotes[option]
          });
        } else {
          await this.$services.optionVotes.create({
            option
          });
        }
      })();
    },
    addSuggestion() {
      (async () => {
        if (this.suggestion && this.suggestion.trim()) {
          this.addingSuggestion = true;
          const option = await this.$services.questionOptions.create({
            question: this.question._id,
            text: this.suggestion
          });
          await this.$services.optionVotes.create({
            option: option._id
          });
          this.suggestDialog = false;
          this.suggestion = '';
          this.addingSuggestion = false;
        }
      })();
    },
    listen() {
      this.$services.questionOptions.on('created', async (option) => {
        if (!this.users[option.user]) {
          this.$set(this.users, option.user, this.loadingUser);
          const users = await this.$services.users.find({
            query: {
              _id: option.user,
              $select: ['display_name', 'image']
            }
          });
          this.users[option.user] = users.data[0];
        }
        this.options.unshift(option);
        this.$set(this.votesByOption, option._id, []);
      });
      this.$services.optionVotes.on('created', (vote) => {
        this.votesByOption[vote.option].push(vote);
        if (vote.user === this.user._id) {
          this.$set(this.userVotes, vote.option, vote._id);
        }
      });
      this.$services.optionVotes.on('removed', (vote) => {
        const votes = this.votesByOption[vote.option];
        const existingVote = votes.find(v => v._id === vote._id);
        const index = votes.indexOf(existingVote);
        this.votesByOption[vote.option].splice(index, 1);
        if (vote.user === this.user._id) {
          this.$set(this.userVotes, vote.option, undefined);
        }
      });
    },
    load() {
      (async () => {
        const questions = await this.$services.questions.find();
        this.question = questions.data[0] || {};
        if (this.question._id) {
          const options = await this.$services.questionOptions.find({
            query: {
              question: this.question._id,
              $or: [{
                archived: null
              }, {
                archived: false
              }]
            }
          });
          this.options = options.data;
          const option_ids = [];
          const user_ids = [];
          this.options.forEach(option => {
            option_ids.push(option._id);
            this.$set(this.votesByOption, option._id, []);
            user_ids.push(option.user);
            this.$set(this.users, option.user, this.loadingUser);
          });

          const { 0: votes, 1: users } = await Promise.all([
            this.$services.optionVotes.find({
              query: {
                _id: {
                  $in: option_ids
                }
              }
            }),
            this.$services.users.find({
              query: {
                _id: {
                  $in: user_ids
                },
                $select: ['display_name', 'image']
              }
            })
          ]);

          users.data.forEach(user => {
            this.users[user._id] = user;
          });

          votes.data.forEach(vote => {
            this.votesByOption[vote.option].push(vote);
            if (vote.user === this.user._id) {
              this.$set(this.userVotes, vote.option, vote._id);
            }
          });

          this.loading = false;
        }
      })();
    }
  }
};
</script>
