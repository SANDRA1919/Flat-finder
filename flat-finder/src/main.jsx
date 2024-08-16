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
import PrivateRoute from './components/PrivateRoute';
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
import SendMessage from './pages/SendMessage';  // Asigură-te că importul este corect
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
              <Route path="/my-flats" element={<PrivateRoute><MyFlats /></PrivateRoute>} />
              <Route path="/new-flat" element={<PrivateRoute><NewFlat /></PrivateRoute>} />
              <Route path="/edit-flat/:id" element={<PrivateRoute><EditFlat /></PrivateRoute>} />
              <Route path="/flat/:id" element={<FlatView />} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/profile-update/:id" element={<PrivateRoute><ProfileUpdate /></PrivateRoute>} />
              <Route path="/all-users" element={<PrivateRoute><AllUsers /></PrivateRoute>} />
              <Route path="/inbox" element={<PrivateRoute><Inbox /></PrivateRoute>} />
              <Route path="/send-message/:flatId" element={<PrivateRoute><SendMessage /></PrivateRoute>} /> {/* Adaugă ruta corectă */}
              <Route path="*" element={<Home />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
