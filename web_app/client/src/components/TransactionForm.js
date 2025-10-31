// web_app/client/src/components/TransactionForm.js
import React, { useState } from 'react';
import {
  TextField, Button, Box, Typography, Grid, Select, MenuItem,
  FormControl, InputLabel, Paper, Alert, CircularProgress,
  Card, CardContent, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider
} from '@mui/material';
import {
  Send, CheckCircle, Warning, Info, Assessment
} from '@mui/icons-material';
import axios from 'axios';

const ResultDialog = ({ open, onClose, result }) => {
  if (!result) return null;

  const isFraud = result.prediction === 'Fraud';
  const riskLevel = result.riskScore >= 70 ? 'high' : result.riskScore >= 40 ? 'medium' : 'low';
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ 
        background: isFraud ? 'linear-gradient(135deg, #f5576c 0%, #ff6b81 100%)' : 
                             'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
        color: 'white'
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          {isFraud ? <Warning fontSize="large" /> : <CheckCircle fontSize="large" />}
          <Typography variant="h5" fontWeight="bold">
            {isFraud ? 'Fraudulent Transaction Detected!' : 'Transaction Verified'}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        <Card elevation={0} sx={{ bgcolor: '#f5f7fa', mb: 2 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Transaction ID
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {result.transactionId}
            </Typography>
          </CardContent>
        </Card>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Risk Score
              </Typography>
              <Chip 
                label={`${result.riskScore}%`}
                color={riskLevel === 'high' ? 'error' : riskLevel === 'medium' ? 'warning' : 'success'}
                sx={{ mt: 1, fontWeight: 'bold', fontSize: '1rem' }}
              />
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Chip 
                label={result.prediction}
                color={isFraud ? 'error' : 'success'}
                sx={{ mt: 1, fontWeight: 'bold', fontSize: '1rem' }}
              />
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Transaction Details
        </Typography>
        <Box sx={{ bgcolor: '#f5f7fa', p: 2, borderRadius: 1 }}>
          <Typography variant="body2">Amount: ₹{result.details?.amount}</Typography>
          <Typography variant="body2">From: {result.details?.senderUpiId}</Typography>
          <Typography variant="body2">To: {result.details?.receiverUpiId}</Typography>
          <Typography variant="body2">Type: {result.details?.transactionType}</Typography>
        </Box>

        {isFraud && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              Recommended Action: Block this transaction immediately
            </Typography>
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const TransactionForm = () => {
  const [formData, setFormData] = useState({
    amount: '',
    transactionType: 'P2P',
    senderUpiId: '',
    receiverUpiId: '',
    deviceId: '',
    location: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5001/api/detect', formData);
      setResult(response.data);
      
      // Save to localStorage
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      transactions.unshift(response.data);
      localStorage.setItem('transactions', JSON.stringify(transactions.slice(0, 50)));
      
      setDialogOpen(true);
      
      // Reset form
      setFormData({
        amount: '',
        transactionType: 'P2P',
        senderUpiId: '',
        receiverUpiId: '',
        deviceId: '',
        location: '',
      });
    } catch (error) {
      console.error("Error analyzing transaction:", error);
      setError(error.response?.data?.message || 'Failed to analyze transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f7fa', minHeight: 'calc(100vh - 64px)' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          maxWidth: 900, 
          mx: 'auto',
          borderRadius: 2,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
        }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Assessment sx={{ fontSize: 40, color: '#667eea' }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Analyze Transaction
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Submit transaction details for fraud detection analysis
            </Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleAnalyze}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Amount (₹)"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                disabled={loading}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required disabled={loading}>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  name="transactionType"
                  value={formData.transactionType}
                  label="Transaction Type"
                  onChange={handleChange}
                >
                  <MenuItem value="P2P">P2P (Person to Person)</MenuItem>
                  <MenuItem value="P2M">P2M (Person to Merchant)</MenuItem>
                  <MenuItem value="Business">Business Transaction</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Sender UPI ID"
                name="senderUpiId"
                value={formData.senderUpiId}
                onChange={handleChange}
                disabled={loading}
                placeholder="user@paytm"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Receiver UPI ID"
                name="receiverUpiId"
                value={formData.receiverUpiId}
                onChange={handleChange}
                disabled={loading}
                placeholder="merchant@googlepay"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Device ID (Optional)"
                name="deviceId"
                value={formData.deviceId}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location (Optional)"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
            sx={{
              mt: 4,
              py: 1.5,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
              }
            }}
          >
            {loading ? 'Analyzing Transaction...' : 'Analyze Transaction'}
          </Button>
        </Box>
      </Paper>

      <ResultDialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        result={result} 
      />
    </Box>
  );
};

export default TransactionForm;