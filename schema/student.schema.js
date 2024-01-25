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
            required: false,
        },
        middleName: {
            type: String,
            required: false,
        },
        lastName: {
            type: String,
            required: false,
        },
        dob: {
            type: Date,
            required: false,
        },
        location: String,
        relegionId: {
            type:Number,
            required: false
        },
        categoryId: {
            type:Number,
            required: false
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Other"],
            required: false,
        },
        email: {
            type: String,
            required: false,
        },
        phoneNo: {
            type: String,
            required: false,
        },
        aadharCard: {
            type: String,
            unique: false,
            required: false,
        },
        address: {
            city: {
                type: String,
                required: false,
            },
            state: {
                type: String,
                required: false,
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
