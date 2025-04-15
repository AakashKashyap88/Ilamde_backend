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


route.get("/GetCalender",async (req,res) => {
   try{

  const response = await calender.find();
  //.select('-eventImages');;


  return res.status(200).json({Events:response})
   }catch(e){
    console.log("Error: ",e)
    return res.status(500).json({ error: "Internal Server Error" });
   }
});


route.get("/GetCalenderV2", async (req, res) => {
    try {
      
        const { year, month } = req.query;

    
        if (!year || !month) {
            return res.status(400).json({ error: "Year and month are required" });
        }


        const response = await calender.find({
            year: year,
            month: month
        });

        return res.status(200).json({ Events: response });
    } catch (e) {
        console.log("Error: ", e);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});



route.put("/UpdateCalender",async (req,res)=>{
try{
    const {eventID,bigAbout}=req.body
   const response=await calender.findByIdAndUpdate(eventID,{ bigAbout: bigAbout }, {
    new: true,
    runValidators: true,
  });

  if (!response) {
    return res.status(404).json({ error: "Event Not Found!" });
  }

  console.log("Event is Updated" ,response);
  return res.status(200).json({ msg: "Event is Updated" });

}catch(e){
    console.log("Error: ",e)
    return res.status(500).json({ error: "Internal Server Error" });
}

})

module.exports=route