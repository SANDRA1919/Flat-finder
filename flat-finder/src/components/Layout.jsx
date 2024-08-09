import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Box } from '@mui/material';

const Layout = () => {
  return (
    <div>
      <Navbar />
      <Box sx={{ p: 3 }}>
        <Outlet />
      </Box>
    </div>
  );
};

export default Layout;