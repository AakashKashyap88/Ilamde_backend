const express = require("express");
const route = express.Router();
const mongoose = require("mongoose")
const Users=require('../models/users/userSchema')
const upload=require("../middleware/imageUploadMiddle")

const { jwtMiddleWare, generateToken } = require("../middleware/jwtAuthMiddle");



const emailValidator = (email) => {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
};

// Email validation middleware
const validateEmail = (req, res, next) => {
  const { email } = req.body;
  
  if (!emailValidator(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  next();
};


route.post("/signup",validateEmail,async (req,res)=>{
  try{
 
    const data = req.body;
     const existingUseEmail = await Users.findOne({ email: data.email });
 

console.log("Receved from Fronted: ",data)

    if (existingUseEmail) {
        return res.status(400).json({ error: "Email already exists!" });
    }
    const newUser = new Users(data)
    const response = await newUser.save();
    const jwtPayload = { id: response.id, email: response.email };

    const token = generateToken(jwtPayload)

    console.log("User SignUp Sucessfuly",response)
    res.status(200).json({ msg: "User SignUp Successfully!", token: token });

  }catch(error){
    console.log("error", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
  
})



route.post("/login", validateEmail,async (req,res)=>{
  try{
      const { email, password } = req.body; 
  
  console.log("email and pass: ",email,password)
  const user= await Users.findOne({email:email})
  if(!user){
    return res.status(401).json({error:"No Accot Found"})
  }
  
  if(!user || !(await user.comparePassword(password))){
      return res.status(401).json({error:"Invalid Email Or Password"})
  }
  
  const jwtPayload={id:user.id,email:user.email }
     const token = generateToken(jwtPayload)
     console.log("Login Sucessfull !");
     res.status(200).json({ msg: "User Login Successfully!", token: token });
  
  }catch(e){
      console.log("error", e);
      return res.status(500).json({ error: "Internal Server Error" });
  }
    })


    

    route.get("/getUser",jwtMiddleWare,async (req,res)=>{
   try{
    const userId=req.jwtPayload.id

    if (!userId) return res.status(400).json({ error: "Invalid Token Data" });
      
    console.log("Extracted User ID:", userId);

    // // Convert userId to ObjectId
    // const objectId = new mongoose.Types.ObjectId(userId);
    // console.log("Converted ObjectId:", objectId);



    const response = await Users.findOne({ _id: userId})

 if (!response) {
      return res.status(404).json({ error: "User Not Found!" });
    }
    console.log("User Fateched Successfully!");
    return res.status(200).json(response);
   }catch(e){
    console.log("error", e);
    return res.status(500).json({ error: "Internal Server Error" });
   }
   
    })


    route.put("/update",jwtMiddleWare,async (req,res)=>{
      try{
        const userId=req.jwtPayload.id
        const updateddata=req.body

        if (!userId) return res.status(400).json({ error: "Invalid Token Data" });
        console.log("Extracted User ID:", userId);

        const response = await Users.findByIdAndUpdate(userId,updateddata,{
          new: true,
          runValidators: true,
        });

        if (!response) {
          return res.status(404).json({ error: "User Not Found!" });
        }
        console.log("User is Updated");
        return res.status(200).json({ msg: "User is Updated" });
        }catch(e){
          console.log("error", e);
          return res.status(500).json({ error: "Internal Server Error" });
        }
    })


    route.put("/updateUserProfile",jwtMiddleWare,upload.single("photo"),async (req,res)=>{
     try{
      const userId=req.jwtPayload.id
      const updateddata =req.body

      console.log("Request Data:", updateddata);

      if (req.file) {
        updateddata.profilePic = `/uploads/${req.file.filename}`;  // Save image path in DB
    }



      if (!userId) return res.status(400).json({ error: "Invalid Token Data" });
      console.log("Extracted User ID:", userId);

     

      const response = await Users.findByIdAndUpdate(userId,updateddata,{
        new: true,
        runValidators: true,
      });

      if (!response) {
        return res.status(404).json({ error: "User Not Found!" });
      }

      console.log("User is Updated",response);
      console.log("User is Updated");
      return res.status(200).json({ msg: "User is Updated" });

     }catch(e){
      console.log("error", e);
      return res.status(500).json({ error: "Internal Server Error" });
     }


    })


  


module.exports = route;
