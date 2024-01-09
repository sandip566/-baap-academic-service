const mongoose = require('mongoose');

const student = new mongoose.Schema(
  {
    studentId: {
      type: Number,
    },
    groupId: {
      type: Number,
      default: 1
    },
    name: {
      type: String,
      required: true
    },
    dob: {
      type: Date,
      required: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phoneNo: {
      type: String,
      required: true
    },
    aadharCard: {
      type: String,
      unique: true,
      required: true
    },
    cast: {
      type: String,
      required: true
    },
    parentName: {
      type: String,
      required: true
    },
    parentAge: {
      type: Number,
      required: true
    },
    parentEmail: {
      type: String,
      required: true
    },
    parentPhoneNo: {
      type: String,
      required: true
    },
    Address: {
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      }
    },
    marks: {
      SSCmarks: {
        Percentage: Number,
        PassOutYear: Number
      },
      HSCmarks: {
        Percentage: Number,
        PassOutYear: Number,
        Stream: String
      }
    },
    emergencyContact: {
      type: Number,
      required: true
    },
    motherName: {
      type: String
    }
  },
  { strict: false, timestamps: true }
);
student.plugin(require('mongoose-autopopulate'))
const studentModel = mongoose.model('student', student);
module.exports = studentModel;
