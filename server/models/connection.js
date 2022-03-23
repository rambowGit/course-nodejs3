const mongoose = require('mongoose');
require('dotenv').config();

let uri = process.env.uriDB;

mongoose.Promise = global.Promise;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.connection.on('connected', ()=>{
    console.log('Connected to Db');
});


mongoose.connection.on('error', (err)=>{
    console.log(`Err ${err}`);
})

mongoose.connection.on('disconected', ()=>{
    console.log('Disconnected');
})
