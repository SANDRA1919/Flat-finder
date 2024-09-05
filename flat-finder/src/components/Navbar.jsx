import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Badge,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../hooks/useAuth';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme, useMediaQuery } from '@mui/material';

const Navbar = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg')); // Custom breakpoint 1024px
  const isMobile = useMediaQuery(theme.breakpoints.down('lg')); // For mobile view

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      if (user) {
        try {
          const messagesQuery = query(collection(db, 'messages'), where('recipientId', '==', user.uid), where('isRead', '==', false));
          const messagesSnapshot = await getDocs(messagesQuery);
          setUnreadMessagesCount(messagesSnapshot.size);
        } catch (error) {
          console.error('Error fetching unread messages:', error);
        }
      }
    };

    fetchUnreadMessages();

    const intervalId = setInterval(fetchUnreadMessages, 30000);

    return () => clearInterval(intervalId);
  }, [user]);

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleLogoutConfirm = async () => {
    await logout();
    navigate('/login');
    setOpenDialog(false);
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleHomeClick = () => {
    if (!user) {
      setShowLoginPrompt(true);
    } else {
      navigate('/');
    }
  };

  const closeLoginPrompt = () => {
    setShowLoginPrompt(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: 'emerald' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={handleHomeClick}
            disabled={!user}
            sx={{ p: 0 }}
          >
            <img
              src="/img/flat-finder-high-resolution-logo-black-transparent-white.png"
              alt="Flat Finder Logo"
              style={{ height: '40px', marginRight: '10px' }}
            />
          </IconButton>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 2 }}>
              {user.isAdmin ? (
                <AdminPanelSettingsIcon sx={{ marginRight: 1 }} />
              ) : (
                <PersonIcon sx={{ marginRight: 1 }} />
              )}
              <Typography variant="h6" component="div">
                Welcome, {user.firstName} {user.lastName}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Desktop View */}
        {isDesktop && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {user && (
              <>
                <Button color="inherit" component={Link} to="/">
                  Home
                </Button>
                <Button color="inherit" component={Link} to="/inbox">
                  <Badge badgeContent={unreadMessagesCount} color="error">
                    Inbox
                  </Badge>
                </Button>
                <Button color="inherit" component={Link} to="/my-flats">
                  My Flats
                </Button>
                <Button color="inherit" component={Link} to="/favorites">
                  Favorites
                </Button>
                <Button color="inherit" component={Link} to="/profile">
                  Profile
                </Button>
                {user.isAdmin && (
                  <Button color="inherit" component={Link} to="/all-users">
                    All users
                  </Button>
                )}
                <Button color="inherit" onClick={handleDialogOpen}>
                  Logout
                </Button>
              </>
            )}
          </Box>
        )}

        {/* Mobile View */}
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>

      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            <ListItem button onClick={handleHomeClick}>
              <ListItemText primary="Home" />
            </ListItem>
            {user ? (
              <>
                <ListItem button component={Link} to="/inbox">
                  <ListItemText primary="Inbox" />
                </ListItem>
                <ListItem button component={Link} to="/my-flats">
                  <ListItemText primary="My Flats" />
                </ListItem>
                <ListItem button component={Link} to="/favorites">
                  <ListItemText primary="Favorites" />
                </ListItem>
                <ListItem button component={Link} to="/profile">
                  <ListItemText primary="Profile" />
                </ListItem>
                {user.isAdmin && (
                  <ListItem button component={Link} to="/all-users">
                    <ListItemText primary="All users" />
                  </ListItem>
                )}
                <ListItem button onClick={handleDialogOpen}>
                  <ListItemText primary="Logout" />
                </ListItem>
              </>
            ) : (
              <ListItem button onClick={() => navigate('/login')}>
                <ListItemText primary="Sign In / Register" />
              </ListItem>
            )}
          </List>
          <Divider />
        </Box>
      </Drawer>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirm} color="primary">
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Login Prompt Dialog */}
      <Dialog
        open={showLoginPrompt}
        onClose={closeLoginPrompt}
        aria-labelledby="login-prompt-dialog-title"
      >
        <DialogTitle id="login-prompt-dialog-title">Login Required</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You need to log in to access this page.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeLoginPrompt} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Navbar;
