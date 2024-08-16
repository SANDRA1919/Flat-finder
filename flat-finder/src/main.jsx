// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import theme from './Theme';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import MyFlats from './pages/MyFlats';
import NewFlat from './pages/NewFlat';
import Favorites from './pages/Favorites';
import EditFlat from './pages/EditFlat';
import FlatView from './pages/FlatView';
import Profile from './pages/Profile';
import ProfileUpdate from './pages/ProfileUpdate';
import AllUsers from './pages/AllUsers';
import Inbox from './pages/Inbox';
import SendMessage from './pages/SendMessage'; 
import './firebase';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <ToastContainer />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/my-flats" element={<MyFlats />} />
              <Route path="/new-flat" element={<NewFlat />} />
              <Route path="/edit-flat/:id" element={<EditFlat />} />
              <Route path="/flat/:id" element={<FlatView />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile-update/:id" element={<ProfileUpdate />} />
              <Route path="/all-users" element={<AllUsers />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/send-message/:flatId" element={<SendMessage />} /> 
              <Route path="*" element={<Home />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
