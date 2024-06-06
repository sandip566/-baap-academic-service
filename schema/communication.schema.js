const mongoose = require('mongoose');

const communicationSchema = new mongoose.Schema({
    
    receiver: {
         type: String,
         required: true 
        },
    sender: {
         type: String,
         required: true 
        },
    message: {
         type: String, 
        required: true 
    },
    groupId: {
         type: Number,
         required: true
        },
    receiverId:{
        type:Number,
        required:true
    },
    senderId:{
        type:Number,
        required:true
    },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Communication', communicationSchema);
