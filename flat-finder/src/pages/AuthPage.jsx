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
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          birthDate: form.birthDate,
          isAdmin: false,
        });
        toast.success('Registration successful');
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
    <Container component="main" maxWidth="xs" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'auto', px: 2 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <Paper elevation={10} sx={{ display: 'flex', flexDirection: 'row', width: '120vh', maxWidth: 900, height: 'auto', borderRadius: 3, overflow: 'hidden' }}>
          <Box
            sx={{
              backgroundColor: '#004d40',
              color: '#fff',
              p: 2,
              width: '60%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <motion.div
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Typography variant="h4" gutterBottom>
                {isRegister ? "Welcome to Flat Finder!" : "Welcome Back!"}
              </Typography>
            </motion.div>
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
          <Box
            sx={{
              p: 2,
              width: '40%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                {isRegister ? "Create an Account" : "Login to Your Account"}
              </Typography>
            </motion.div>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              {isRegister && (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
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
                  </motion.div>
                </>
              )}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
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
              </motion.div>
              {isRegister && (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
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
                  </motion.div>
                </>
              )}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.8 }}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default AuthPage;
