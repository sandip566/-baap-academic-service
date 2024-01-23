const mongoose = require("mongoose");

const student = new mongoose.Schema(
    {
        studentId: {
            type: Number,
        },
        groupId: {
            type: Number,
            default: 1,
        },
        title: {
            type: String,
        },
        firstName: {
            type: String,
            required: true,
        },
        middleName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        dob: {
            type: Date,
            required: true,
        },
        location: String,
        relegion: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "relegions",
            autopopulate: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "categories",
            autopopulate: true,
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Other"],
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phoneNo: {
            type: String,
            required: true,
        },
        aadharCard: {
            type: String,
            unique: true,
            required: true,
        },
        address: {
            city: {
                type: String,
                required: true,
            },
            state: {
                type: String,
                required: true,
            },
        },
        marks: {
            SSCmarks: {
                Percentage: Number,
                PassOutYear: Number,
            },
            HSCmarks: {
                Percentage: Number,
                PassOutYear: Number,
                Stream: String,
            },
        },
        familyDetails: {
            fathersName: String,
            fatherPhone: Number,
            mothersName: String,
            mothersPhone: Number,
            guardiansName: String,
            guardiansPhone: Number,
        },
        emergencyContact: [
            {
                name: String,
                phone: Number,
                relation: String,
            },
        ],
        contact: {
            phoneNumber: Number,
            email: String,
            whatsappNo: Number,
            facebook: String,
            instagram: String,
            linkedinURL: String,
        },
        securitySettings: {
            smartId: Number,
            chekList: {
                type: String,
                enum: ["Notification on whatsapp", "Public Profile URL"],
            },
        },
        document: {
            docTitle: String,
            expiryDate: Date,
        },
        references: [
            {
                name: String,
                phone: Number,
                relation: String,
                email: String,
            },
        ],
    },
    { strict: false, timestamps: true }
);
student.plugin(require("mongoose-autopopulate"));
const studentModel = mongoose.model("student", student);
module.exports = studentModel;
