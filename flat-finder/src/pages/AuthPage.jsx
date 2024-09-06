import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Box, Container } from '@mui/material';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { setDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import validator from 'validator';
import { motion } from 'framer-motion';

const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(true);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    let tempErrors = {};
    if (isRegister) {
      if (!form.firstName) tempErrors.firstName = "First Name is required";
      if (!form.lastName) tempErrors.lastName = "Last Name is required";
      if (!form.email) tempErrors.email = "Email is required";
      else if (!validator.isEmail(form.email)) tempErrors.email = "Invalid Email";
      if (!form.password) tempErrors.password = "Password is required";
      else if (form.password.length < 6) tempErrors.password = "Password must be at least 6 characters";
      else if (!validator.isStrongPassword(form.password, { minSymbols: 1 })) tempErrors.password = "Password must contain at least one symbol";
      if (form.password !== form.confirmPassword) tempErrors.confirmPassword = "Passwords do not match";
      if (!form.birthDate) tempErrors.birthDate = "Birth Date is required";
    } else {
      if (!form.email) tempErrors.email = "Email is required";
      if (!form.password) tempErrors.password = "Password is required";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    if (isRegister) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
        const user = userCredential.user;
  
        // Store user details in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          birthDate: form.birthDate,
          isAdmin: false,
        });
  
        // Immediately sign out after registration
        await auth.signOut();
  
        // Notify success and redirect to login
        toast.success('Registration successful. Please log in.');
        navigate('/login');
      } catch (error) {
        toast.error(`Error: ${error.message}`);
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, form.email, form.password);
        toast.success('Login successful');
        navigate('/');
      } catch (error) {
        toast.error('Invalid email or password');
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%', // Ensures full-width coverage
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/img/login.jpg)', 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'absolute', // Ensure the image covers the whole viewport
        top: 60,
        left: 0,
      }}
    >
    <Container
      component="main"
      maxWidth="md"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // Adjusted height for better vertical centering
        px: 2,
      }}
    >
  <Paper
    elevation={10}
    sx={{
      display: 'flex',
      width: '120vh',
      maxWidth: '200%', // Ensure it doesn't overflow
      height: '520px',
      borderRadius: 3,
      overflow: 'hidden', 
      position: 'relative', 
       backgroundColor: 'transparent', backdropFilter: 'blur(10px)'
    }}
  >
      {/* Left side (Register form) */}
      <Box
        sx={{
          width: '50%', 
          backgroundColor: '#004d40',
          color: '#fff',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" gutterBottom>
          {isRegister ? "Welcome to Flat Finder!" : "Welcome Back!"}
        </Typography>
        <Typography variant="body1">
          {isRegister
            ? "Register to find your dream flat today!"
            : "Log in to continue your journey."}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => setIsRegister(!isRegister)}
          sx={{
            mt: 6,
            borderColor: '#fff',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#fff',
              color: '#004d40',
            },
          }}
        >
          {isRegister ? "Have an account? Login" : "New here? Register"}
        </Button>
      </Box>

      {/* Right side (Form section) */}
      <Box
        sx={{
          width: '50%', 
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" align="center" sx={{ mb: 2 }}>
          {isRegister ? "Create an Account" : "Login to Your Account"}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          {isRegister && (
            <>
              <TextField
                margin="normal"
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                autoComplete="given-name"
                autoFocus
                value={form.firstName}
                onChange={handleChange}
                error={Boolean(errors.firstName)}
                helperText={errors.firstName}
                size="small"
                sx={{ mb: 1 }}
              />
              <TextField
                margin="normal"
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                value={form.lastName}
                onChange={handleChange}
                error={Boolean(errors.lastName)}
                helperText={errors.lastName}
                size="small"
                sx={{ mb: 1 }}
              />
            </>
          )}
          <TextField
            margin="normal"
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            error={Boolean(errors.email)}
            helperText={errors.email}
            size="small"
            sx={{ mb: 1 }}
          />
          <TextField
            margin="normal"
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            value={form.password}
            onChange={handleChange}
            error={Boolean(errors.password)}
            helperText={errors.password}
            size="small"
            sx={{ mb: 1 }}
          />
          {isRegister && (
            <>
              <TextField
                margin="normal"
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword}
                size="small"
                sx={{ mb: 1 }}
              />
              <TextField
                margin="normal"
                fullWidth
                name="birthDate"
                label="Birth Date"
                type="date"
                id="birthDate"
                InputLabelProps={{ shrink: true }}
                value={form.birthDate}
                onChange={handleChange}
                error={Boolean(errors.birthDate)}
                helperText={errors.birthDate}
                size="small"
                sx={{ mb: 1 }}
              />
            </>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 2,
              backgroundColor: '#004d40',
              '&:hover': { backgroundColor: '#00796b' },
            }}
          >
            {isRegister ? "Register" : "Login"}
          </Button>
        </Box>
      </Box>
  </Paper>
</Container>
</Box>            
  );
};

export default AuthPage;
