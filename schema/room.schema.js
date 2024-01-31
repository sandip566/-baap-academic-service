const mongoose = require("mongoose");

const room = new mongoose.Schema(
    {
      roomId:{
        type:Number,
        require:false
      },
      status:{
        type:String,
        enum:["avilable","notAvilable"]
      },
      capacity:{
        type:Number,
      },
      hostelId:{
        type:Number,
        require:false
      }
    },
    { strict: false, timestamps: true }
);
room.plugin(require("mongoose-autopopulate"));
const roomModel = mongoose.model("room", room);
module.exports = roomModel;
