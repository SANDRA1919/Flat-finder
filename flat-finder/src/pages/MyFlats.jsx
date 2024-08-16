import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import FlatCard from '../components/FlatCard';
import { useAuth } from '../hooks/useAuth';
import { Container, Paper, Grid, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Link } from 'react-router-dom';

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
    <Container component="main" maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
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
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Flat?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this flat? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyFlats;
