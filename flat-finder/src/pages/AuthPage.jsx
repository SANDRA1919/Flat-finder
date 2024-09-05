import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Box, Container } from '@mui/material';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { setDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import validator from 'validator';

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
        console.error('Error during registration:', error);
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, form.email, form.password);
        toast.success('Login successful');
        navigate('/');
      } catch (error) {
        toast.error(`Error: ${error.message}`);
        console.error('Error during login:', error);
      }
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      birthDate: '',
    });
    setErrors({});
  };

  return (
    <Container
      component="main"
      maxWidth="none"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:'red',
        px: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          maxWidth: '1200px',
          height: '80vh',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: 10,
          position: 'relative',
        }}
      >
        <Box
          sx={{
            width: '50%',
            backgroundColor: '#004d40',
            color: '#fff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            p: 4,
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            transition: 'transform 0.6s ease-in-out',
            transform: isRegister ? 'translateX(0)' : 'translateX(-100%)',
            zIndex: isRegister ? 1 : 0,
          }}
        >
          <Typography variant="h4" align="center" gutterBottom>
            Bun venit!
          </Typography>
          <Typography variant="h6" align="center">
            Înregistrează-te sau autentifică-te pentru a accesa contul tău.
          </Typography>
        </Box>
        <Box
          sx={{
            width: '50%',
            backgroundColor: '#fff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            p: 4,
            position: 'absolute',
            top: 0,
            right: 0,
            height: '100%',
            transition: 'transform 0.6s ease-in-out',
            transform: isRegister ? 'translateX(100%)' : 'translateX(0)',
            zIndex: isRegister ? 0 : 1,
          }}
        >
          <Typography variant="h4" align="center" gutterBottom>
            {isRegister ? "Creează un Cont" : "Autentifică-te în Contul Tău"}
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            {isRegister && (
              <>
                <TextField
                  margin="normal"
                  fullWidth
                  id="firstName"
                  label="Prenume"
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
                  label="Nume"
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
              label="Adresă de Email"
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
              label="Parolă"
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
                  label="Confirmă Parola"
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
                  label="Data Nașterii"
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
              {isRegister ? "Înregistrează-te" : "Autentifică-te"}
            </Button>
            <Button
              onClick={toggleMode}
              fullWidth
              sx={{ mt: 2 }}
            >
              {isRegister ? "Ai deja un cont? Autentifică-te" : "Nu ai un cont? Înregistrează-te"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default AuthPage;
