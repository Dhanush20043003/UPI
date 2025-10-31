// web_app/server/routes/api.js

const express = require('express');
const axios = require('axios');
const router = express.Router();

const ML_API_URL = 'http://127.0.0.1:5000/predict';

// Middleware to validate transaction data
const validateTransaction = (req, res, next) => {
  const { amount, senderUpiId, receiverUpiId } = req.body;
  
  if (!amount || !senderUpiId || !receiverUpiId) {
    return res.status(400).json({ 
      error: 'Missing required fields: amount, senderUpiId, receiverUpiId' 
    });
  }
  
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  
  next();
};

router.post('/', validateTransaction, async (req, res) => {
  try {
    const transactionData = req.body;
    console.log('🔍 Analyzing transaction:', transactionData);

    // Transform data to match ML model's expected format
    // The ML model expects features like Time, V1-V28, Amount
    // For now, we'll create a mock transformation
    const mlData = {
      Time: Date.now() / 1000,
      Amount: parseFloat(transactionData.amount),
      // Add V1-V28 features (in real implementation, extract from transaction data)
      ...Array.from({ length: 28 }, (_, i) => ({ [`V${i + 1}`]: Math.random() }))
        .reduce((acc, obj) => ({ ...acc, ...obj }), {})
    };

    const response = await axios.post(ML_API_URL, mlData, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('✅ ML API Response:', response.data);
    
    // Calculate risk score based on prediction
    const isFraud = response.data.prediction === 'Fraud';
    const riskScore = isFraud ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 40);
    
    res.json({
      prediction: response.data.prediction,
      riskScore,
      isFraud,
      transactionId: `UPI${Date.now()}`,
      timestamp: new Date().toISOString(),
      details: transactionData
    });
    
  } catch (error) {
    console.error('❌ Error connecting to ML API:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'ML service unavailable',
        message: 'Please ensure the Python Flask server is running on port 5000'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to analyze transaction',
      message: error.message 
    });
  }
});

module.exports = router;