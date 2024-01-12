const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
    {
        courseId: Number,
        name: {
            type: String,
            required: true,
        },
        groupId: {
            type: Number,
            default: 1
        },
        duration: {
            type: String,
            required: true,
        },
        //  courseFee: {
        //      type: mongoose.Schema.Types.ObjectId,
        //      autopopulate: true,
        //      // ref:feesPayment,
        //  },
        numberOfSemister: {
            type: Number,
            require: true
        },
        maxixmumAllowedStudent: {
            type: Number,
            require: true
        },
        abbrivation: {
            type: String,
            require: true
        },
        provider: {
            type: String,
            require: true
        },
        courseFormat: {
            type: String,
            require: true
        },
        academicYear: {
            type: mongoose.Schema.Types.ObjectId,
            require: true,
            autopopulate: true,
            ref: 'academicyear'
        },
        division: {
            type: [mongoose.Schema.Types.ObjectId],
            autopopulate: true,
            ref: 'division'
        },
        subjects: {
            sem1: {
                type: [mongoose.Schema.Types.ObjectId],
                autopopulate: true,
                ref: 'subject'
            },
            sem2: {
                type: [mongoose.Schema.Types.ObjectId],
                autopopulate: true,
                ref: 'subject'
            },
            sem3: {
                type: [mongoose.Schema.Types.ObjectId],
                autopopulate: true,
                ref: 'subject'
            },
            sem4: {
                type: [mongoose.Schema.Types.ObjectId],
                autopopulate: true,
                ref: 'subject'
            },
            sem5: {
                type: [mongoose.Schema.Types.ObjectId],
                autopopulate: true,
                ref: 'subject'
            },
            sem6: {
                type: [mongoose.Schema.Types.ObjectId],
                autopopulate: true,
                ref: 'subject'
            }
        }

    },
    { strict: false, timestamps: true }
);
courseSchema.plugin(require("mongoose-autopopulate"));
const courseModel = mongoose.model("course", courseSchema);
module.exports = courseModel;
