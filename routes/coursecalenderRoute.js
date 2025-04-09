const express = require("express");
const route = express.Router();
const calender=require("../models/courseClander/coursecalenderSchema")
const upload=require("../middleware/imageUploadMiddle")

route.post("/create",upload.single("photo"),async(req,res)=>{
try{
    const data = req.body

    if (req.file) {
        data.eventImages = `/uploads/${req.file.filename}`;  // Save image path in DB
    }


    const newCalender = new calender(data);
    const response = await newCalender.save();
console.log("Created Succesfully! ",response)
res.status(200).json({msg:"calender Created Sucessfuly!", resp:response});
}catch(e){
    console.log("Error: ",e)
    return res.status(500).json({ error: "Internal Server Error" });
}

});

module.exports=route