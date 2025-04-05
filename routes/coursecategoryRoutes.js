const express = require("express");
const route = express.Router();
const CourseCategory = require("../models/courses/courseCategorySchema");

route.post("/create",async (req,res)=>{
try{
    const data = req.body
    const newCategory = new CourseCategory(data);
    const response = await newCategory.save();
console.log("Category Created Succesfully! ",response)
res.status(200).json({msg:"Category Created Sucessfuly!"});
}catch(e){
    console.log("Error: ",e)
    return res.status(500).json({ error: "Internal Server Error" });
}


})

module.exports=route




