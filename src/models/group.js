'use strict';

const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  jid: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    default: null,
  },
},{
  timestamps: true,
},);



module.exports.Group = mongoose.model('group', groupSchema);
module.exports.groupSchema = groupSchema;
