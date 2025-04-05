const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema=mongoose.Schema({
    username:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    mobile: { type: String,default:null},
    language:{type:String,default:null}, 
    password:{type:String,required:true},
    gender:{ type : String, default: null },
    city: { type: String, default: null },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Courses" ,default:null}],
    profilePic:{type: String,default:"/uploads/userbhai.png"},
},{ timestamps: true })

userSchema.pre("save", async function (next) {
    const user = this; // ✅ 'this' refers to the document
    if (!user.isModified("password")) return next();
  
    try {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      next();
    } catch (e) {
      next(e);
    }
  });


  userSchema.methods.comparePassword = async function (canditdatePassword) {
    try {
      const isMatch = await bcrypt.compare(canditdatePassword, this.password);
      return isMatch;
    } catch (e) {
      throw e;
    }
  };


const Users = mongoose.model("Users", userSchema);
module.exports=Users;