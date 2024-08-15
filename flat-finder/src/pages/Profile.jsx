import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db, auth } from '../firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { Container, Paper, Typography, Button, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack } from '@mui/material';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, refreshCurrentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const fetchUserDetails = async () => {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setIsAdmin(userDoc.data().isAdmin);
        setBirthDate(userDoc.data().birthDate);
      };
      fetchUserDetails();
    }
  }, [user]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleDeleteAccount = async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await deleteDoc(userRef);
      await deleteUser(auth.currentUser);
      toast.success('Account deleted successfully');
      navigate('/register');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Error deleting account');
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3, mt: 3, border: '2px solid #4CAF50', backgroundColor: '#F0FFF0' }}>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>
        <Box>
          <Typography variant="body1">
            <strong>First Name:</strong> {user?.firstName}
          </Typography>
          <Typography variant="body1">
            <strong>Last Name:</strong> {user?.lastName}
          </Typography>
          <Typography variant="body1">
            <strong>Email:</strong> {user?.email}
          </Typography>
          <Typography variant="body1">
            <strong>Birth Date:</strong> {birthDate}
          </Typography>
          <Typography variant="body1">
            <strong>Admin:</strong> {isAdmin ? 'Yes' : 'No'}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }} // Stack in a column on xs and row on sm and above
              spacing={2} // Space between the buttons
            >
              <Button variant="contained" color="primary" onClick={() => navigate(`/profile-update/${user.uid}`)}>
                Edit Profile
              </Button>
              <Button variant="contained" color="error" onClick={handleOpenDialog}>
                Delete Account
              </Button>
            </Stack>
          </Box>
        </Box>
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
        >
          <DialogTitle>{"Confirm Account Deletion"}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete your account? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteAccount} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default Profile;
