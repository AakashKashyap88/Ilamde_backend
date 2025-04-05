const mongoose = require("mongoose");


const doctorSchema = mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    profileImage:{type:String},
    experience:{type:String,required:true},
    qualification:{type:String,required:true},
    address:{type:String,required:true}},{timestamps: true })

const Doctors = mongoose.model("Doctors", doctorSchema); 
module.exports=Doctors;