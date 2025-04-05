const express = require("express");
const route = express.Router();
const Doctors = require("../models/doctors/doctorSchems");
const upload = require("../middleware/imageUploadMiddle");
route.post("/create",upload.single("photo"),async (req,res)=>{
    try{
    const data = req.body;
    
    if (req.file) {
        data.profileImage = `/uploads/${req.file.filename}`;  // Save image path in DB
    }

        const newDoctor = new Doctors(data)
        const response = await newDoctor.save();
        console.log("Doctor Created Sucessfuly",response)
        res.status(200).json({msg:"Doctor Created Sucessfuly!"});
    }catch(error){
        console.log("error", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
})


route.get("/getdoctors",async(req,res)=>{
try{
    const response = await Doctors.find()

    return  res.status(200).json({Doctors:response});
}catch(e){
    console.log("error", error);
    return res.status(500).json({ error: "Internal Server Error" });
}

})


module.exports = route;