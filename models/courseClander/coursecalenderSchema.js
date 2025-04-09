const mongoose = require("mongoose");

const courseCalenderSchema = mongoose.Schema({
    year: {
        type: Number,
        required: true
    },
    month: {
        type: String,
        enum: [ // To avoid typos
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ],
        required: true
    },
    date: {
        type: Number,
        min: 1,
        max: 31,
        required: true
    },
    event: {
        type: String,
        required: true,
        trim: true
    },
    eventplace: {
        type: String,
        trim: true
    },
    eventImages:{type: String
    }

}, { timestamps: true });

const CourseCalender = mongoose.model("CourseCalender", courseCalenderSchema);
module.exports = CourseCalender;
