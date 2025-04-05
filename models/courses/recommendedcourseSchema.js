const { Certificate } = require("crypto");
const mongoose = require("mongoose");
const { type } = require("os");

const recommededCourse = mongoose.Schema({
    name: { type: String },
    images: { type: String },
    Reviews: { type: String }
  }, { timestamps: true });
  
  const RecommendedCourses = mongoose.model("RecommendedCourses", recommededCourse);
  module.exports = RecommendedCourses;