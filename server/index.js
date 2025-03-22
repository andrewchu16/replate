require('dotenv').config()
const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const axios = require('axios');
// const { send } = require('process');
const twilio_client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Initialize Express app
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const server = app.listen(3000, () => {
  console.log('Server running on port 3000');
});

// Initialize Socket.IO
const io = socketIO(server);
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Define routes
app.post('/api/get-meal-plan', async (req, res) => {
  const userPreferences = req.body; 
  console.log(userPreferences);
  try {
    const mealPlanUrl = 'http://localhost:3000/api/mealplan/';
    const response = await axios.get(mealPlanUrl, { params: userPreferences });
    const mealPlan = response.data;

    res.json(mealPlan);
  } catch (error) {
    console.error('Error fetching meal plan:', error.message);
    res.status(500).json({ code: 'MEAL_PLAN_ERROR', message: 'Failed to fetch meal plan' });
  }
});

const sendSMSMessage = (message) => {
  twilio_client.messages
    .create({
        from: process.env.TWILIO_TO_NUMBER,
        to: process.env.TWILIO_RECEIVER_NUMBER,
        body: message 
    })
    .then(msg => console.log(`${msg.sid} sent successfully`));
}


app.post('/api/order', (req, res) => {
  const { mealItems } = req.body;

  console.log(mealItems);

  if (!mealItems || !Array.isArray(mealItems)) {
    return res.status(400).json({ code: 'INVALID_REQUEST', message: 'Invalid format for mealitems' });
  }

  mealItems.forEach((mealItem, index) => {
    /*
      name: string;
      price: number;
      longitude: number;
      latitude: number;
      rating: number;
      storeName: string;
      imgUrl: string;
      distance: number; 
    */

    // Create a unique event channel for each meal item. 
    // Clients should listen to events on the channel: `orderUpdate-order-${index}`.

    const channel = `/ws/delivery-status/${index}`;
    const orderUpdate = {
      mealItem,
      status: 'Order Received',
      timestamp: new Date().toISOString()
    };

    // Emit initial order update for this meal item
    io.emit(channel, orderUpdate);

    setTimeout(() => {
      io.emit(channel, { ...orderUpdate, status: 'Preparing' });
      // sendSMSMessage(`Meal ${mealItem.name || index} is Preparing`);
    }, 5000);

    setTimeout(() => {
      io.emit(channel, { ...orderUpdate, status: 'Out for Delivery' });
      // sendSMSMessage(`Meal ${mealItem.name || index} is Out for Delivery`);
    }, 10000);

    setTimeout(() => {
      io.emit(channel, { ...orderUpdate, status: 'Delivered' });
      sendSMSMessage(`Meal ${mealItem.name || index} is Delivered`);
    }, 15000);
  });

  res.status(200).json({ code: 'ORDER_SUCCESS', message: 'Order placed successfully' });
});





