// src/components/Navbar.jsx
import React, { useState } from 'react';
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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../hooks/useAuth';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    const isConfirmed = window.confirm('Are you sure you want to logout?');
    if (isConfirmed) {
      await logout();
      navigate('/login');
    }
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const menuItems = (
    <>
      <ListItem button component={Link} to="/">
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
          <ListItem button onClick={handleLogout}>
            <ListItemText primary="Logout" />
          </ListItem>
        </>
      ) : (
        <>
          <ListItem button component={Link} to="/login">
            <ListItemText primary="Login" />
          </ListItem>
          <ListItem button component={Link} to="/register">
            <ListItemText primary="Register" />
          </ListItem>
        </>
      )}
    </>
  );

  return (
    <AppBar position="static" sx={{ backgroundColor: 'emerald' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>FlatFinder</Link>
          </Typography>
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

        {/* Hamburger Icon */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
        </Box>

        {/* Full Menu (Desktop) */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          {user ? (
            <>
              <Button color="inherit" component={Link} to="/inbox">
                Inbox
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
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>

      {/* Drawer Menu (Mobile) */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            {menuItems}
          </List>
          <Divider />
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
