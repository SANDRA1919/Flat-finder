import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import FlatCard from '../components/FlatCard';
import { useAuth } from '../hooks/useAuth';
import { Container, Paper, Grid, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography, Box, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete'; // Importing the Delete icon
import CloseIcon from '@mui/icons-material/Close'; // Importing the Close icon

const MyFlats = () => {
  const { user } = useAuth();
  const [flats, setFlats] = useState([]);
  const [open, setOpen] = useState(false);
  const [flatToDelete, setFlatToDelete] = useState(null);

  useEffect(() => {
    const fetchMyFlats = async () => {
      const flatsQuery = query(collection(db, 'flats'), where('ownerId', '==', user.uid));
      const flatSnapshot = await getDocs(flatsQuery);
      const flatList = flatSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        favorites: doc.data().favorites || [],
      }));
      setFlats(flatList);
    };

    fetchMyFlats();
  }, [user]);

  const handleOpenDialog = (flatId) => {
    setFlatToDelete(flatId);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setFlatToDelete(null);
  };

  const handleDelete = async () => {
    if (flatToDelete) {
      await deleteDoc(doc(db, 'flats', flatToDelete));
      setFlats(flats.filter(flat => flat.id !== flatToDelete));
      handleCloseDialog();
    }
  };

  const handleToggleFavorite = (flatId) => {
    setFlats(flats.map(flat => 
      flat.id === flatId ? { ...flat, favorites: flat.favorites.includes(user.uid) ? flat.favorites.filter(uid => uid !== user.uid) : [...flat.favorites, user.uid] } : flat
    ));
  };

  return (
    <Box
    sx={{
      minHeight: '100vh',
      width: '100vw', // Ensures full-width coverage
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'url(/img/myflats.jpg)', // Path to your background image
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'absolute', // Ensure the image covers the whole viewport
      top: 60,
      left: 0,
    }}
  >
    <Container component="main" maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mt: 3, backgroundColor: 'transparent', backdropFilter: 'blur(10px)', }}>
        <Button component={Link} to="/new-flat" variant="contained" color="primary" sx={{ mb: 2 }}>
          Add New Flat
        </Button>
        <Grid container spacing={3}>
          {flats.map((flat) => (
            <Grid item xs={12} md={6} key={flat.id}>
              <FlatCard 
                flat={flat} 
                onDelete={() => handleOpenDialog(flat.id)} 
                onToggleFavorite={handleToggleFavorite} 
              />
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      {/* Enhanced Delete Confirmation Dialog */}
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <Box display="flex" alignItems="center">
            <DeleteIcon color="error" sx={{ mr: 2 }} />
            <Typography variant="h6">Delete Flat?</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this flat? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </Box>
  );
};

export default MyFlats;
