// web_app/client/src/components/History.js
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Tabs, Tab, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Tooltip,
  TablePagination, TextField, InputAdornment
} from '@mui/material';
import { 
  CheckCircle, Cancel, Warning, Visibility, Search, History as HistoryIcon 
} from '@mui/icons-material';

const getRiskColor = (risk) => {
  if (risk >= 70) return 'error';
  if (risk >= 40) return 'warning';
  return 'success';
};

const getStatusIcon = (status) => {
  if (status === 'Fraud') return <Cancel color="error" />;
  if (status === 'Valid') return <CheckCircle color="success" />;
  return <Warning color="warning" />;
};

const History = () => {
  const [tabValue, setTabValue] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const savedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    setTransactions(savedTransactions);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = searchTerm === '' || 
      t.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.details?.senderUpiId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.details?.receiverUpiId?.toLowerCase().includes(searchTerm.toLowerCase());

    if (tabValue === 1) return matchesSearch && t.prediction === 'Fraud';
    if (tabValue === 2) return matchesSearch && t.riskScore >= 40 && t.riskScore < 70;
    if (tabValue === 3) return matchesSearch && t.prediction === 'Valid';
    return matchesSearch;
  });

  const paginatedTransactions = filteredTransactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f7fa', minHeight: 'calc(100vh - 64px)' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
        }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <HistoryIcon sx={{ fontSize: 40, color: '#667eea' }} />
          <Box flex={1}>
            <Typography variant="h5" fontWeight="bold">
              Transaction History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and filter all analyzed transactions
            </Typography>
          </Box>
          <TextField
            size="small"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 'bold',
                fontSize: '1rem'
              }
            }}
          >
            <Tab label={`All (${transactions.length})`} />
            <Tab 
              label={`Fraud (${transactions.filter(t => t.prediction === 'Fraud').length})`}
              sx={{ color: '#f5576c' }}
            />
            <Tab 
              label={`Flagged (${transactions.filter(t => t.riskScore >= 40 && t.riskScore < 70).length})`}
              sx={{ color: '#ffa726' }}
            />
            <Tab 
              label={`Valid (${transactions.filter(t => t.prediction === 'Valid').length})`}
              sx={{ color: '#4caf50' }}
            />
          </Tabs>
        </Box>

        {filteredTransactions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <HistoryIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No transactions found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start analyzing transactions to see them here
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Transaction ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Sender</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Receiver</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Risk Score</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedTransactions.map((row, index) => (
                    <TableRow 
                      key={index}
                      sx={{ 
                        '&:hover': { bgcolor: '#f5f7fa' },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <TableCell>
                        <Tooltip title={row.prediction}>
                          {getStatusIcon(row.prediction)}
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {row.transactionId?.substring(0, 15)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          ₹{row.details?.amount}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                          {row.details?.senderUpiId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                          {row.details?.receiverUpiId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${row.riskScore}%`} 
                          color={getRiskColor(row.riskScore)} 
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(row.timestamp).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              component="div"
              count={filteredTransactions.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default History;