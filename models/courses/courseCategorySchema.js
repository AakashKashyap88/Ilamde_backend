const mongoose = require("mongoose");

const coursecategorySchema=mongoose.Schema({
    name:{type:String,required:true,unique:true}
},{timestamps: true})

const CourseCategory = mongoose.model("CourseCategory", coursecategorySchema);
module.exports=CourseCategory;