const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
            default: 1
        },
        courseId: Number,
        Code: {
            type: Number,
            required: true
        },
        CourseName: {
            required: true,
            type: String
        },
        Duration: {
            type: String,
            required: true,
        },
        Mode: {
            type: String,
            required: true
        },
        University: {
            type: String,
            required: true
        },
        Fees: {
            type: mongoose.Schema.Types.ObjectId,
            autopopulate: true,
            ref: 'feesTemplate',
        },

        // numberOfSemister: {
        //     type: Number,
        //     require: true
        // },
        // maxixmumAllowedStudent: {
        //     type: Number,
        //     require: true
        // },
        // abbrivation: {
        //     type: String,
        //     require: true
        // },
        // provider: {
        //     type: String,
        //     require: true
        // },
        // courseFormat: {
        //     type: String,
        //     require: true
        // },
        // academicYear: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     require: true,
        //     autopopulate: true,
        //     ref: 'academicyear'
        // },
        // division: {
        //     type: [mongoose.Schema.Types.ObjectId],
        //     autopopulate: true,
        //     ref: 'division'
        // },
        // subjects: {
        //     sem1: {
        //         type: [mongoose.Schema.Types.ObjectId],
        //         autopopulate: true,
        //         ref: 'subject'
        //     },
        //     sem2: {
        //         type: [mongoose.Schema.Types.ObjectId],
        //         autopopulate: true,
        //         ref: 'subject'
        //     },
        //     sem3: {
        //         type: [mongoose.Schema.Types.ObjectId],
        //         autopopulate: true,
        //         ref: 'subject'
        //     },
        //     sem4: {
        //         type: [mongoose.Schema.Types.ObjectId],
        //         autopopulate: true,
        //         ref: 'subject'
        //     },
        //     sem5: {
        //         type: [mongoose.Schema.Types.ObjectId],
        //         autopopulate: true,
        //         ref: 'subject'
        //     },
        //     sem6: {
        //         type: [mongoose.Schema.Types.ObjectId],
        //         autopopulate: true,
        //         ref: 'subject'
        //     }
        // }

    },
    { strict: false, timestamps: true }
);
courseSchema.plugin(require("mongoose-autopopulate"));
const courseModel = mongoose.model("course", courseSchema);
module.exports = courseModel;
