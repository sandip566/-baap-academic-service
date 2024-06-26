const mongoose = require("mongoose");

const SubjectMarksMapSchema = new mongoose.Schema(
    {
        groupId: {
            type: Number,
        },
        subjectMarksMapId: {
            type: Number
        },
        name: {
            type: String,
            required: true,
        },
        termtypesId: {
            type: Number,
            required: false
        },
        subject: [
            {
                subjectName: {
                    type: String,
                    required: false
                },
                priority: {
                    type: Number,
                    required: false
                },
                max: {
                    type: Number,
                    required: false
                },
                min: {
                    type: Number,
                    required: false
                },
                gradePattern: {
                    type: String,
                    required: false
                },
                Attachment: {
                    type: String,
                    required: false
                },
                indicator: {
                    type: Boolean,
                    default: true
                },
                graded: {
                    type: Boolean,
                    default: false
                }
            }
        ]
    }, { strict: false, timestamps: true }
);

const SubjectMarksMapModel = mongoose.model("subjectmarksmap", SubjectMarksMapSchema);
module.exports = SubjectMarksMapModel;
