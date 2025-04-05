const { Certificate } = require("crypto");
const mongoose = require("mongoose");
const { type } = require("os");


// const courseSchema = mongoose.Schema({
//     coursecategory:{type:String,required: true},
//     title:{type:String,required:true},
//     shortDescription:{type:String,required:true},
//     fullDescription:{type:String,required:true},
//     duration:{type:String,required:true},
//     module:{type:String,required:true},
//     fellowshipCertificate:{type:String,required:true},
//     training:{type:String,required:true},
//     objective:{type:String},
//     whyoneshoulddothisProgramme:{ type: [String]},
// })

const courseSchema= mongoose.Schema({
    coursecategory:{type:String,required: true},
    title:{type:String,required:true},
    description:{type:String,required:true},
    duration:{type:String,required:true},
    module:{type:String,require:true},
    trainingtype:{type:String,require:true},
    coursereviews:{type:String},
    courseimages:{type: [String]},
    price:{type:Number,required:true},
    whyoneshoulddothisProgramme:{ type: [String]},
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
    lectures: [ {
        title: { type: String, required: true },
        videoUrl: { type: String, required: true } }],
}
,{ timestamps: true })


const Courses = mongoose.model("Courses", courseSchema);
module.exports=Courses;