import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { Container, Paper, TextField, Button, Typography, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { toast } from 'react-toastify';

const ProfileUpdate = () => {
  const { id } = useParams();
  const { user, refreshCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (user && user.uid === id) {
        const userDoc = await getDoc(doc(db, 'users', id));
        if (userDoc.exists()) {
          setForm({
            firstName: userDoc.data().firstName,
            lastName: userDoc.data().lastName,
            birthDate: userDoc.data().birthDate,
          });
        }
      }
    };

    fetchUser();
  }, [id, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    try {
      if (user) {
        // Actualizează numele în Firebase Authentication
        await updateProfile(auth.currentUser, {
          displayName: `${form.firstName} ${form.lastName}`,
        });

        // Actualizează datele în Firestore
        await updateDoc(doc(db, 'users', id), {
          firstName: form.firstName,
          lastName: form.lastName,
          birthDate: form.birthDate,
        });

        // Reîmprospătează utilizatorul curent în context
        await refreshCurrentUser();

        toast.success('Profile updated successfully');
        navigate('/profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleConfirm = () => {
    handleClose();
    handleSubmit();
  };

  if (!user) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Update Profile
        </Typography>
        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleOpen(); }} sx={{ mt: 3 }}>
          <TextField
            label="First Name"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Last Name"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Birth Date"
            name="birthDate"
            value={form.birthDate}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            type="date"
            InputLabelProps={{ shrink: true }}
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Save Changes
          </Button>
        </Box>
      </Paper>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Changes"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to change your profile information?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfileUpdate;