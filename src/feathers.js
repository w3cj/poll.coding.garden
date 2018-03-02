import Feathers from '@feathersjs/client';
// const hooks = require('feathers-hooks')
import io from 'socket.io-client';
import host from './host';

const socket = io(host);
const feathers = Feathers()
  .configure(Feathers.socketio(socket))
  // .configure(hooks())
  .configure(Feathers.authentication({
    storage: window.localStorage
  }));

export default feathers;
