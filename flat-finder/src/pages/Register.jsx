import React, { useState } from 'react';
import { TextField, Button, Checkbox, FormControlLabel, Paper, Typography, Box, Container } from '@mui/material';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { setDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import validator from 'validator';

const Register = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!form.firstName) tempErrors.firstName = "First Name is required";
    if (!form.lastName) tempErrors.lastName = "Last Name is required";
    if (!form.email) tempErrors.email = "Email is required";
    else if (!validator.isEmail(form.email)) tempErrors.email = "Invalid Email";
    if (!form.password) tempErrors.password = "Password is required";
    else if (form.password.length < 6) tempErrors.password = "Password must be at least 6 characters";
    else if (!validator.isStrongPassword(form.password, { minSymbols: 1 })) tempErrors.password = "Password must contain at least one symbol";
    if (form.password !== form.confirmPassword) tempErrors.confirmPassword = "Passwords do not match";
    if (!form.birthDate) tempErrors.birthDate = "Birth Date is required";
    else if (new Date().getFullYear() - new Date(form.birthDate).getFullYear() < 18) tempErrors.birthDate = "You must be at least 18 years old";
    if (!form.acceptTerms) tempErrors.acceptTerms = "You must accept the terms and conditions";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Creare utilizator în Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;
      console.log("User created: ", user.uid);

      // Salvare date utilizator în Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        birthDate: form.birthDate,
        isAdmin: false,
      });

      // Afișează mesaj de succes și redirecționează la pagina de login
      toast.success('Registration successful');
      navigate('/login');
    } catch (error) {
      console.error("Error occurred: ", error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('This email is already registered. Please log in.');
      } else {
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Paper elevation={6} sx={{ padding: 2, maxWidth: 400, backgroundColor: '#e0f2f1', overflow: 'auto' }}>
        <Typography variant="h5" align="center" gutterBottom sx={{ color: '#004d40' }}>
          Register
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          {/* Form Fields */}
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
            sx={{ input: { color: '#004d40' }, label: { color: '#004d40' }, '& .MuiInput-underline:before': { borderBottomColor: '#004d40' } }}
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
            sx={{ input: { color: '#004d40' }, label: { color: '#004d40' }, '& .MuiInput-underline:before': { borderBottomColor: '#004d40' } }}
          />
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
            sx={{ input: { color: '#004d40' }, label: { color: '#004d40' }, '& .MuiInput-underline:before': { borderBottomColor: '#004d40' } }}
          />
          <TextField
            margin="normal"
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            error={Boolean(errors.password)}
            helperText={errors.password}
            size="small"
            sx={{ input: { color: '#004d40' }, label: { color: '#004d40' }, '& .MuiInput-underline:before': { borderBottomColor: '#004d40' } }}
          />
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
            sx={{ input: { color: '#004d40' }, label: { color: '#004d40' }, '& .MuiInput-underline:before': { borderBottomColor: '#004d40' } }}
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
            sx={{ input: { color: '#004d40' }, label: { color: '#004d40' }, '& .MuiInput-underline:before': { borderBottomColor: '#004d40' } }}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="acceptTerms"
                color="primary"
                checked={form.acceptTerms}
                onChange={handleChange}
              />
            }
            label="I accept the terms and conditions"
            sx={{ color: '#004d40', mt: 1 }}
          />
          {errors.acceptTerms && (
            <Typography variant="body2" color="error">
              {errors.acceptTerms}
            </Typography>
          )}
          {/* Register Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2, mb: 1, backgroundColor: '#00796b', '&:hover': { backgroundColor: '#004d40' } }}
          >
            Register
          </Button>

          {/* Login Redirect Button */}
          <Button
            fullWidth
            variant="outlined"
            sx={{ mb: 2, color: '#00796b', borderColor: '#00796b', '&:hover': { borderColor: '#004d40', color: '#004d40' } }}
            onClick={() => navigate('/login')}
          >
            Already have an account? Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
