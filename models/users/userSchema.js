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
    enrolledCourses: [{
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Courses" },
      enrollmentDate: { type: Date, required: true },
      expiryDate: { type: Date, required: true },
      accessLevel: { type: Number, default: 0 },
      paidAmount:{type:Number, default: 0 },
      remaingAmount:{type:Number, default: 0 }
    }],
    profilePic:{type: String,default:"/uploads/userbhai.png"},
    cart: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Courses",
        },
        quantity: {
          type: Number, 
          default: 1,
        }
      }
    ]
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