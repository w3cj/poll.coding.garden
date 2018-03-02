import feathers from './feathers';

export default {
  users: feathers.service('users'),
  questions: feathers.service('questions'),
  questionOptions: feathers.service('question-options'),
  optionVotes: feathers.service('option-votes')
};
