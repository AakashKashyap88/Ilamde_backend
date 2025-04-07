const express = require("express");
const app = express();
const database = require("./database");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const path = require('path');
require('dotenv').config();

app.get("/",(req,res)=>{
    res.send("Hellow World!")
})


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const userRoutes = require("./routes/userRoutes")
app.use("/user",userRoutes)

const courseRoutes = require("./routes/courseRoutes")
app.use("/courses",courseRoutes)

const doctorRoutes=require("./routes/doctorRoutes")
app.use("/doctors",doctorRoutes)

const categoryRoutes=require("./routes/coursecategoryRoutes")
app.use("/category",categoryRoutes)

const recommededCourseRoute = require("./routes/recommendedcoureseRoute")
app.use("/recommended",recommededCourseRoute)

const carts=require("./routes/cartRoute")
app.use("/cart",carts)



const PORT=process.env.PORT || 3000

app.listen(3000, () => {
    console.log(`Server is Running http://localhost:3000`);
  });