'use strict';

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  jid: {
    type: String,
    required: true,
  },
  pushName: {
    type: String,
    default: null,
  },
},{
  timestamps: true,
},);



module.exports.User = mongoose.model('user', userSchema);
module.exports.userSchema = userSchema;
