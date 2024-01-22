const mongoose=require('mongoose')
const courseSchema = new mongoose.Schema(
    {
        groupId: {
            type:Number,
            default:1
        },
        courseId: Number,
        Code:{
            type:Number,
            required:true
        },
        CourseName: {
            required:true,
            type:String
        },
        Duration: {
            type: String,
            required: true,
        },
        Mode:{
            type:String,
            required:true
        },
        University:{
            type:String,
            required:true
         },
        Fees: {
            //  type: mongoose.Schema.Types.ObjectId,
            //  autopopulate: true,
            //  ref:'feesTemplate',
            type:Number
         }, 
    },
    { strict: false, timestamps: true }
);
courseSchema.plugin(require("mongoose-autopopulate"));
const courseModel = mongoose.model("course", courseSchema);
module.exports = courseModel;
