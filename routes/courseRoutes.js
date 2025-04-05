const express = require("express");
const route = express.Router();
const Courses = require("../models/courses/courseSchema");
const RecommendedCourses = require("../models/courses/recommendedcourseSchema");
const { jwtMiddleWare, generateToken } = require("../middleware/jwtAuthMiddle");
const upload = require("../middleware/imageUploadMiddle");

// const storage=multer.diskStorage({
// destination:(req,file,cb)=>{
//     cb(null,'uploads/');
// },
// filename:(req,file,cb)=>{
//     cb(null,Date.now()+file.originalname);
// }

// })
// const upload=multer({storage})

// route.post("/multertest",upload.single('photo'),async (req,res)=>{
// try{
//     if (!req.file) {
//         return res.status(400).json({ error: "File not uploaded" });
//       }

//       const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
//       res.status(200).json({ msg: "Image uploaded successfully", imageUrl });

// }catch(e){
//     console.log("error", error);
//     return res.status(500).json({ error: "Internal Server Error" });
// }


// })

route.post("/createCourse",jwtMiddleWare, async (req,res)=>{
try{
    const data = req.body;
    const newCourse = new Courses(data)
    const response = await newCourse.save();
    console.log("Course Created Sucessfuly",response)
    res.status(200).json({msg:"Course Created Sucessfuly!"});
}catch(error){
    console.log("error", error);
    return res.status(500).json({ error: "Internal Server Error" });
}

})


route.post("/createrecommendedcourses",upload.single("photo"),async (req,res)=>{
    try{
        const data = req.body;
        
        if (req.file) {
            data.profileImage = `/uploads/${req.file.filename}`;  // Save image path in DB
        }
    
            const newCourse = new RecommendedCourses(data)
            const response = await newCourse.save();
            console.log("newCourse Created Sucessfuly",response)
            res.status(200).json({msg:"Doctor Created Sucessfuly!"});
        }catch(error){
            console.log("error", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
})


route.put("/updateCourse/:id",jwtMiddleWare, async (req,res)=>{
    try{
    
    const CourseId = req.params.id;
    const updatedData = req.body;

    const response = await Courses.findByIdAndUpdate(CourseId, updatedData, {
        new: true,
        runValidators: true,
      });

      if (!response) {
        return res.status(404).json({ error: "Course Not Found!" });
      }

    console.log("Course is Updated");
    return res.status(200).json({ msg: "Course is Updated" });

    }catch(e){
        console.log("error", e);
    return res.status(500).json({ error: "Internal Server Error" });
    }


})

route.get("/getcourse", async (req,res)=>{
try{
    const data = req.query.coursecategory; 
    const course = await Courses.find({coursecategory:data})
    console.log(data)
    console.log(course)
    
   return res.status(200).json(course)
}catch(e){
    console.log("error", e)
    return res.status(500).json({ error: "Internal Server Error" });
}
    

})


module.exports = route;