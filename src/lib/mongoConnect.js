
module.exports = async () => {
  const mongoose = require('mongoose');
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/baileys-api'
  
  mongoose.set('strictQuery', false);
  await mongoose.connect(uri, { 
    useNewUrlParser: true,
    useUnifiedTopology: true, 
  });

  console.log('MongoDB connection sucessfully.');

}