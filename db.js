const mongoose = require('mongoose');
const mongoURI = "mongodb://127.0.0.1:27017/icontactlist?readPreference=primary&appName=MongoDB%25Compass&directConnection=true&tls=false"

const connectToMongo = ()=>{
    mongoose.connect(mongoURI, ()=>{
        console.log("Connected to mongo successfully")
    })
}

module.exports = connectToMongo;
