const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/users/userSchema'); // Users schema
const Courses = require('../models/courses/courseSchema');
const { jwtMiddleWare, generateToken } = require("../middleware/jwtAuthMiddle");
const { route } = require('./userRoutes');


router.post('/add', jwtMiddleWare, async (req, res) => {

    const userId=req.jwtPayload.id;
    const {courseId } = req.body;
  
    try {
      const user = await User.findById(userId);
      const course = await Courses.findById(courseId);
  
      if (!user || !course) {
        return res.status(404).json({ message: 'User or Course not found' });
      }
  
      const existingItemIndex = user.cart.findIndex(item => item.courseId.toString() === courseId);
  
      if (existingItemIndex > -1) {
        // If already added, increase quantity
        // user.cart[existingItemIndex].quantity += 1;
        return res.status(200).json({message:'Course already added to your cart'})
      } else {
        // Else add new course to cart
        user.cart.push({ courseId });
      }
  
      await user.save();
  
      res.status(200).json({ message: 'Course added to cart successfully', cart: user.cart });
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


  router.get('/get', jwtMiddleWare, async (req, res) => {
    try{
    
        const userId=req.jwtPayload.id;

        if (!userId) {
            return res.status(400).json({ message: "User ID not found in token" });
          }
          const user = await User.findById(userId).populate({
            path: 'cart.courseId',
            select: '_id title price courseimages module coursereviews ',
          });

          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
         
          let totalPrice = 0;


         

          const cartItems = user.cart.map(item => {
      const course = item.courseId;
      const quantity = item.quantity;
      const price = course?.price || 0;

      totalPrice += price * quantity;

      return {
        course,
        quantity
      };
    });

    res.status(200).json({ 
        cart: cartItems,
        totalPrice  // 👈 Added total price
      });

    }catch(e){
        console.error('Error geeting to cart:', error);
        res.status(500).json({ message: 'Internal Server Error' });

    }

  });


  router.delete('/remove', jwtMiddleWare, async (req, res) => {
    try {
      const userId = req.jwtPayload.id;
      const courseId = req.query.courseId; 
  
      // console.log("courseId from query:", courseId);
      // console.log("isValid check:", mongoose.Types.ObjectId.isValid(courseId));
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
  
      const user = await User.findById(userId).populate({
        path: 'cart.courseId',
        select: 'price', // only need price here
      });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      console.log("Before removing, user cart is:", user.cart);
      

      // Remove course from cart
      user.cart = user.cart.filter(item => item.courseId._id.toString() !== courseId);
      await user.save();
  
      // Recalculate total price
      const totalPrice = user.cart.reduce((sum, item) => {
        return sum + (item.courseId.price * item.quantity);
      }, 0);
  
      res.status(200).json({ 
        message: 'Course removed from cart successfully', 
        totalPrice 
      });
    } catch (error) {
      console.error('Error removing course from cart:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  




  
  module.exports = router;