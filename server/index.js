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

const cors = require('cors');
app.use(cors());

const server = app.listen(3000, () => {
  console.log('Server running on port 3000');
});

// Initialize Socket.IO with CORS configuration
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3001", // Your Next.js frontend URL
    methods: ["GET", "POST"],
    credentials: true
  }
});
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
    const mealPlanUrl = 'http://localhost:5000/api/mealplan';
    const response = await axios.post(mealPlanUrl, { params: userPreferences });
    const mealPlan = response.data;

    console.log("mealPlan: ", mealPlan);

    res.json({
      status: 'Meal plan created successfully',
      mealPlan: mealPlan
    });
  } catch (error) {
    console.error('Error fetching meal plan:', error.message);
    res.status(500).json({ code: 'MEAL_PLAN_ERROR', message: 'Failed to fetch meal plan' });
  }
});

app.post('/api/order', (req, res) => {
  const { mealItems } = req.body;

  console.log("mealItems");

  console.log('Received mealItems:', mealItems);
  if (!mealItems || !Array.isArray(mealItems)) {
    console.error('Invalid format for mealItems:', mealItems);
    return res.status(400).json({ code: 'INVALID_REQUEST', message: 'Invalid format for mealitems' });
  }
  console.log('Valid mealItems format:', mealItems);

  // Create a map to track confirmation status for first meal item
  const orderConfirmations = new Map();

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

    if (index === 0) {
      // For the first meal item, set confirmation status to false initially
      const orderId = Date.now().toString(); // Generate a unique order ID
      orderConfirmations.set(orderId, false);

      // Send SMS to user asking for confirmation
      sendSMSMessage(`Your order for ${mealItem.name || 'meal #1'} is ready to be dispatched. Reply with 'A'  to proceed.`);
      
      // Emit "Preparing" status after 5 seconds
      setTimeout(() => {
        io.emit(channel, { ...orderUpdate, status: 'Preparing' });
      }, 5000);
      
      // Set up Twilio webhook endpoint for SMS confirmation
      app.post('/api/sms-webhook', (req, res) => {
        const messageBody = req.body.Body;
        const fromNumber = req.body.From;
        
        // Check if the message is a confirmation for any pending order
        if (messageBody && messageBody.startsWith('A')) {
          const parts = messageBody.split(' ');
          if (parts.length === 2) {
            const confirmOrderId = parts[1];
            
            if (orderConfirmations.has(confirmOrderId)) {
              // Mark the order as confirmed
              orderConfirmations.set(confirmOrderId, true);
              
              // Send confirmation receipt to the user
              sendSMSMessage(`Thank you! Your order ${confirmOrderId} is now out for delivery.`, fromNumber);
              
              // Emit "Out for Delivery" status
              io.emit(channel, { ...orderUpdate, status: 'Out for Delivery' });
              
              // After 5 more seconds, emit "Delivered"
              const deliveryTime = 4000 + Math.floor(Math.random() * 3000);
              setTimeout(() => {
                io.emit(channel, { ...orderUpdate, status: 'Delivered' });
              }, deliveryTime);
            } else {
              sendSMSMessage('Invalid order ID. Please check and try again.', fromNumber);
            }
          }
        }
        
        // Send a TwiML response to acknowledge the SMS
        const twiml = new twilio.twiml.MessagingResponse();
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());
      });
    } else {
      const preparingTime = 6 + Math.floor(Math.random() * 3000);
      setTimeout(() => {
        io.emit(channel, { ...orderUpdate, status: 'Preparing' });
        // sendSMSMessage(`Meal ${mealItem.name || index} is Preparing`);
      }, preparingTime);
  
      // Out for Delivery: 8-13 seconds
      const deliveryTime = 8000 + Math.floor(Math.random() * 5000);
      setTimeout(() => {
        io.emit(channel, { ...orderUpdate, status: 'Out for Delivery' });
        // sendSMSMessage(`Meal ${mealItem.name || index} is Out for Delivery`);
      }, deliveryTime);
  
      // Delivered: 14-20 seconds
      const completionTime = 14000 + Math.floor(Math.random() * 6000);
      setTimeout(() => {
        io.emit(channel, { ...orderUpdate, status: 'Delivered' });
        sendSMSMessage(`Meal ${mealItem.name || index} is Delivered`);
      }, completionTime);
    }
  });

  res.status(200).json({ code: 'ORDER_SUCCESS', message: 'Order placed successfully' });
});


function sendSMSMessage(message, toNumber) {
  // This function would use the Twilio client to send messages
  // Example implementation (assuming twilio client is configured elsewhere):
  
  twilio_client.messages.create({
    body: message,
    from: process.env.TWILIO_TO_NUMBER,
    to: toNumber || process.env.TWILIO_RECEIVER_NUMBER // Default to user's registered number if not specified
  })
  .then(message => console.log(`SMS sent with SID: ${message.sid}`))
  .catch(err => console.error('Error sending SMS:', err));
  console.log(`SMS would be sent: ${message} to ${toNumber || 'user'}`);
}