const express = require("express");
const route = express.Router();
const Razorpay = require('razorpay');
const Users = require("../models/users/userSchema");
const Courses = require("../models/courses/courseSchema");
const Payments = require("../models/payments/paymentSchema");
const crypto = require("crypto");
const { jwtMiddleWare, generateToken } = require("../middleware/jwtAuthMiddle");
const razorpay = new Razorpay({
    key_id: 'rzp_live_9XVHIMMHfwASpN',
    key_secret: '4f7phAlldSUsvzKKeWTYX43U'
});




route.post('/create-order', jwtMiddleWare,async (req, res) => {
  const { amount } = req.body; // frontend se amount lo (in paise)
  const userId = req.jwtPayload.id;

  const options = {
    amount: amount*100,
    currency: 'INR',
    receipt: `rcptid_${Date.now()}`,
    payment_capture: 1
  };

  try {

    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const order = await razorpay.orders.create(options);

    console.log("Order Created Succefuly")

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      userDetails: {
        name: user.username,
        email: user.email,
        contact: user.mobile || "9999999999" // fallback number if null
      }
    });

  } catch (err) {
    res.status(500).send("Order creation failed");
  }
});


route.post('/create-order_cart', jwtMiddleWare, async (req, res) => {
  const userId = req.jwtPayload.id;
  const user = await Users.findById(userId).populate({
      path: 'cart.courseId',
      select: 'price',
  });

  if (!user) {
      return res.status(404).json({ message: "User not found" });
  }

  let totalAmount = 0;

  // Calculate total amount for all courses in the cart
  user.cart.forEach(item => {
      totalAmount += item.courseId.price * item.quantity; // multiply by quantity if needed
  });

  const options = {
      amount: totalAmount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `rcptid_${Date.now()}`,
      payment_capture: 1
  };

  try {
      const order = await razorpay.orders.create(options);
      const user2 = await Users.findById(userId);

      res.json({
          order_id: order.id,
          amount: order.amount,
          currency: order.currency,
          userDetails: {
            name: user2.username,
            email: user2.email,
            contact: user2.mobile || "9999999999" // fallback number if null
          }
      });
  } catch (err) {
      console.error('Error creating order:', err);
      res.status(500).send("Order creation failed");
  }
});

route.post("/payment-success_cart", jwtMiddleWare, async (req, res) => {
  try {
      const userId = req.jwtPayload.id;
      const { payment_id, order_id, signature, courseIds, amount,aceeslevel } = req.body;

      const generated_signature = crypto
          .createHmac("sha256", '4f7phAlldSUsvzKKeWTYX43U')
          .update(order_id + "|" + payment_id)
          .digest("hex");

      if (generated_signature !== signature) {
          return res.status(400).json({ success: false, message: "Invalid signature" });
      }

    
     // Get course durations from DB
     const courses = await Courses.find({ _id: { $in: courseIds } });

     const enrolledCourses = courses.map(course => {
       const enrollmentDate = new Date();
       const expiryDate = calculateExpiryDate(enrollmentDate, course.duration);
       return {
         courseId: course._id,
         enrollmentDate,
         expiryDate,
         paidAmount:amount / 100,
         accessLevel:aceeslevel
       };
     });
 
     // Update user with all enrolled courses and expiry dates
     await Users.findByIdAndUpdate(userId, {
       $addToSet: { enrolledCourses: { $each: enrolledCourses } }
     });
 
     // Add user to all courses
     await Courses.updateMany(
       { _id: { $in: courseIds } },
       { $addToSet: { enrolledStudents: userId } }
     );
      
    

      const payment = new Payments({
          user: userId,
          courses: courseIds, 
          amount: amount / 100, 
          transactionId: payment_id,
          status: "completed",
          paidPercentage:aceeslevel
      });

      await payment.save();

      res.json({ success: true, message: "Courses allotted & payment saved successfully" });

  } catch (err) {
      console.error("Payment success error:", err);
      res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


// Helper function to calculate expiry date from duration string
function calculateExpiryDate(startDate, durationString) {
  const durationParts = durationString.split(" ");
  const value = parseInt(durationParts[0]);
  const unit = durationParts[1].toLowerCase();

  const expiryDate = new Date(startDate);

  if (unit.includes("month")) {
    expiryDate.setMonth(expiryDate.getMonth() + value);
  } else if (unit.includes("year")) {
    expiryDate.setFullYear(expiryDate.getFullYear() + value);
  } else if (unit.includes("day")) {
    expiryDate.setDate(expiryDate.getDate() + value);
  }

  return expiryDate;
}



route.post("/payment-success", jwtMiddleWare, async (req, res) => {
  try {
    const userId = req.jwtPayload.id;
    const { payment_id, order_id, signature, courseId, amount ,aceeslevel} = req.body;
  
      var amountInRupees=amount/100

    //  Signature verification
    const generated_signature = crypto
      .createHmac("sha256", '4f7phAlldSUsvzKKeWTYX43U')
      .update(order_id + "|" + payment_id)
      .digest("hex");

    if (generated_signature !== signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }



    const course = await Courses.findById(courseId);
    if (!course) {
      return res.status(400).json({ success: false, message: "Course not found" });
    }

    const courseDuration = course.duration; // e.g., "3 Months", "1 Year", "3 Days"
    let courseDurationInMonths = 0;

    // Parse the duration string to get the total months
    const durationParts = courseDuration.split(" ");
    const durationValue = parseInt(durationParts[0]);
    const durationUnit = durationParts[1].toLowerCase();

    if (durationUnit.includes("month")) {
      courseDurationInMonths = durationValue;
    } else if (durationUnit.includes("year")) {
      courseDurationInMonths = durationValue * 12; // 1 year = 12 months
    } else if (durationUnit.includes("day")) {
      courseDurationInMonths = Math.ceil(durationValue / 30); // approx. 1 month = 30 days
    }

    // Calculate expiry date based on course duration in months
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + courseDurationInMonths);




    //  Add course to user
    await Users.findByIdAndUpdate(userId, {
      $addToSet: {
        enrolledCourses: {
          courseId: courseId,  // ObjectId
          enrollmentDate: new Date(),  // Current date
          expiryDate: expiryDate , // 6 months expiry date
          accessLevel:aceeslevel,
          paidAmount:amountInRupees,
          remaingAmount:course.price - amountInRupees
        }
      }
    });


    //  Add user to course
    await Courses.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: userId }
    });


    const payment = new Payments({
      user: userId,
      course: [courseId],
      amount: amountInRupees, 
      transactionId: payment_id,
      status: "completed",
      accessLevel:aceeslevel,
      paidPercentage:aceeslevel
    });

    await payment.save();

    res.json({ success: true, message: "Course allotted & payment saved successfully" });

  } catch (err) {
    console.error("Payment success error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


route.post("/pay-in-part", jwtMiddleWare, async (req, res) => {
  try {
    const userId = req.jwtPayload.id;
    const { payment_id, order_id, signature, courseId, amount, paidPercentage } = req.body;

    const generated_signature = crypto
      .createHmac("sha256", 'YOUR_SECRET')
      .update(order_id + "|" + payment_id)
      .digest("hex");

    if (generated_signature !== signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const course = await Courses.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    const durationString = course.duration;
    const enrollmentDate = new Date();
    const expiryDate = calculateExpiryDate(enrollmentDate, durationString);

    // Check if already enrolled
    const user = await Users.findById(userId);
    const existing = user.enrolledCourses.find(c => c.courseId.toString() === courseId);

    if (!existing) {
      // Fresh enrollment
      user.enrolledCourses.push({
        courseId,
        enrollmentDate,
        expiryDate,
        paidAmount:amount,
        remaingAmount:course.price - amount,
        accessLevel: paidPercentage
      });
    } else {
      // Just update accessLevel
      existing.paidAmount= existing.paidAmount+amount;
      existing.remaingAmount=existing.remaingAmount-amount;
      existing.accessLevel = paidPercentage;
    }

    await user.save();

    // Add user to course (if not already there)
    await Courses.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: userId }
    });

    const payment = new Payments({
      user: userId,
      course: courseId,
      paidPercentage,
      amount: amount / 100,
      transactionId: payment_id,
      status: "completed",
      paidPercentage:paidPercentage
      
    });

    await payment.save();

    res.json({ success: true, message: `Payment of ${paidPercentage}% done & access updated.` });

  } catch (err) {
    console.error("Part Payment Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


  module.exports = route;