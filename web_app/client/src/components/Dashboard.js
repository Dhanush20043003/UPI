// web_app/client/src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { 
  Grid, Card, CardContent, Typography, Box, Button, LinearProgress,
  Chip, Paper
} from '@mui/material';
import {
  TrendingUp, Warning, CheckCircle, CurrencyRupee, 
  Assessment, Security
} from '@mui/icons-material';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <Card 
    elevation={3}
    sx={{ 
      height: '100%',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      borderLeft: `4px solid ${color}`,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: 6
      }
    }}
  >
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="text.secondary" variant="body2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold" color={color}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Icon sx={{ fontSize: 50, color: color, opacity: 0.3 }} />
      </Box>
    </CardContent>
  </Card>
);

const MetricCard = ({ title, value, color }) => (
  <Box>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      {title}
    </Typography>
    <Box display="flex" alignItems="center" gap={1}>
      <Typography variant="h5" fontWeight="bold" color={color}>
        {value}
      </Typography>
      <Chip 
        label={parseInt(value) > 80 ? "Excellent" : parseInt(value) > 60 ? "Good" : "Fair"} 
        size="small" 
        color={parseInt(value) > 80 ? "success" : parseInt(value) > 60 ? "info" : "warning"}
      />
    </Box>
    <LinearProgress 
      variant="determinate" 
      value={parseInt(value)} 
      sx={{ 
        mt: 1, 
        height: 8, 
        borderRadius: 1,
        backgroundColor: `${color}20`,
        '& .MuiLinearProgress-bar': {
          backgroundColor: color
        }
      }}
    />
  </Box>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTransactions: 0,
    fraudulent: 0,
    flagged: 0,
    totalAmount: 0
  });

  const [metrics] = useState({
    accuracy: 97,
    precision: 95,
    recall: 92,
    f1Score: 93,
    falsePositive: 3
  });

  useEffect(() => {
    // Load stats from localStorage
    const savedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    const fraudCount = savedTransactions.filter(t => t.prediction === 'Fraud').length;
    const flaggedCount = savedTransactions.filter(t => t.riskScore >= 40 && t.riskScore < 70).length;
    const totalAmount = savedTransactions.reduce((sum, t) => sum + parseFloat(t.details?.amount || 0), 0);

    setStats({
      totalTransactions: savedTransactions.length,
      fraudulent: fraudCount,
      flagged: flaggedCount,
      totalAmount: totalAmount.toFixed(2)
    });
  }, []);

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f7fa', minHeight: 'calc(100vh - 64px)' }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Real-time fraud detection analytics and insights
        </Typography>
      </Box>

      {/* Top Statistics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Transactions" 
            value={stats.totalTransactions}
            icon={Assessment}
            color="#667eea"
            subtitle="All analyzed"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Fraudulent" 
            value={stats.fraudulent}
            icon={Warning}
            color="#f5576c"
            subtitle="Blocked"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Flagged for Review" 
            value={stats.flagged}
            icon={Security}
            color="#ffa726"
            subtitle="Needs attention"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Amount" 
            value={`₹${stats.totalAmount}`}
            icon={CurrencyRupee}
            color="#4caf50"
            subtitle="Processed"
          />
        </Grid>
      </Grid>

      {/* Model Performance */}
      <Paper 
        elevation={3}
        sx={{ 
          p: 3, 
          borderRadius: 2,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Model Performance Metrics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              XGBoost Classifier Performance
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            size="small"
            startIcon={<TrendingUp />}
            sx={{ 
              borderColor: '#667eea',
              color: '#667eea',
              '&:hover': {
                borderColor: '#764ba2',
                backgroundColor: '#667eea10'
              }
            }}
          >
            View Details
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={2.4}>
            <MetricCard title="Accuracy" value={`${metrics.accuracy}%`} color="#667eea" />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <MetricCard title="Precision" value={`${metrics.precision}%`} color="#4caf50" />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <MetricCard title="Recall" value={`${metrics.recall}%`} color="#ff9800" />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <MetricCard title="F1 Score" value={`${metrics.f1Score}%`} color="#2196f3" />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <MetricCard title="False Positive" value={`${metrics.falsePositive}%`} color="#f44336" />
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Actions */}
      <Box mt={3} display="flex" gap={2}>
        <Button 
          variant="contained" 
          size="large"
          sx={{
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            fontWeight: 'bold'
          }}
        >
          Analyze New Transaction
        </Button>
        <Button variant="outlined" size="large">
          Export Report
        </Button>
      </Box>
    </Box>
  );
};

export default Dashboard;