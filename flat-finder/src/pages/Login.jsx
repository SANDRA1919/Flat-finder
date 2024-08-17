import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from 'react-toastify';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!form.email) tempErrors.email = "Email is required";
    if (!form.password) tempErrors.password = "Password is required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      toast.success('Login successful');
      navigate('/');
    } catch (error) {
      toast.error('Invalid email or password');
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Paper elevation={6} sx={{ padding: 3, maxWidth: '90%', backgroundColor: '#e0f2f1' }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ color: '#004d40' }}>
          Login
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
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
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            error={Boolean(errors.password)}
            helperText={errors.password}
            size="small"
            sx={{ input: { color: '#004d40' }, label: { color: '#004d40' }, '& .MuiInput-underline:before': { borderBottomColor: '#004d40' } }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2, mb: 2, backgroundColor: '#00796b', '&:hover': { backgroundColor: '#004d40' } }}
          >
            Login
          </Button>

            {/* Register Redirect Button */}
          <Button
            fullWidth
            variant="outlined"
            sx={{ mb: 2, color: '#00796b', borderColor: '#00796b', '&:hover': { borderColor: '#004d40', color: '#004d40' } }}
            onClick={() => navigate('/register')}
          >
            Don`t have an account?   Register
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};
export default Login;