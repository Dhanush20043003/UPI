// web_app/client/src/components/Navbar.js
import React from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem, Divider 
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, Dashboard, Analytics, History, ExitToApp, Person 
} from '@mui/icons-material';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        borderBottom: '3px solid rgba(255,255,255,0.1)'
      }}
    >
      <Toolbar>
        <Shield sx={{ mr: 2, fontSize: 32 }} />
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: 1 }}
        >
          UPI Fraud Detection
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
          <Button 
            color="inherit" 
            component={Link} 
            to="/dashboard"
            startIcon={<Dashboard />}
            sx={{ 
              fontWeight: isActive('/dashboard') ? 'bold' : 'normal',
              backgroundColor: isActive('/dashboard') ? 'rgba(255,255,255,0.2)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' }
            }}
          >
            Dashboard
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/analyze"
            startIcon={<Analytics />}
            sx={{ 
              fontWeight: isActive('/analyze') ? 'bold' : 'normal',
              backgroundColor: isActive('/analyze') ? 'rgba(255,255,255,0.2)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' }
            }}
          >
            Analyze
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/history"
            startIcon={<History />}
            sx={{ 
              fontWeight: isActive('/history') ? 'bold' : 'normal',
              backgroundColor: isActive('/history') ? 'rgba(255,255,255,0.2)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' }
            }}
          >
            History
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar 
            onClick={handleMenu}
            sx={{ 
              cursor: 'pointer', 
              bgcolor: 'white', 
              color: '#667eea',
              fontWeight: 'bold',
              '&:hover': { transform: 'scale(1.1)' },
              transition: 'transform 0.2s'
            }}
          >
            {user.username?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: { mt: 1.5, minWidth: 200 }
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Signed in as
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {user.username}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;