const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: true
  },
  description: {
    type: String,  
    // required: true
  },
  photo: {
    type: String,
    // required: true
  },
  category:{
    type: String,

  },
  price:{
    type:String,
  },
  status:{
    type:String, default:'active'
  },
  date:{
    type:String, default: new Date()
  } ,
  email:{
    type:String,
  } 

});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;