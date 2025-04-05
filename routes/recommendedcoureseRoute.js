const express = require("express");
const route = express.Router();
const recommended=require("../models/courses/recommendedcourseSchema")
const upload=require("../middleware/imageUploadMiddle")

route.post("/createRecommanded",upload.single("photo"),async (req,res)=>{
try{
    const data = req.body;
    
    if (req.file) {
        data.images = `/uploads/${req.file.filename}`;  // Save image path in DB
    }

        const newCourse = new recommended(data)
        const response = await newCourse.save();
        console.log("newCourse Created Sucessfuly",response)
        res.status(200).json({msg:"newCourse Created Sucessfuly!"});

}catch(e){
    console.log("error", error);
    return res.status(500).json({ error: "Internal Server Error" });
}

})


route.get("/getRecommandedCourses",async (req,res)=>{
try{
const response= await recommended.find()
return res.status(200).json({recommendedCourses:response})
}catch(e){
    console.log("error", error);
    return res.status(500).json({ error: "Internal Server Error" });
}

})



module.exports = route;


