const mongoose = require("mongoose");

const paymentSchema=mongoose.Schema({
user:{type: mongoose.Schema.Types.ObjectId, ref: "Users" },
courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Courses" }],
amount:{type:Number,required:true},
transactionId:{type:String,required:true},
status:{type: String, enum: ["pending", "completed", "failed"], default: "pending" },
paidPercentage: { type: Number, required: true },
},{timestamps: true });

const Payments = mongoose.model("Payments", paymentSchema); 
module.exports=Payments;