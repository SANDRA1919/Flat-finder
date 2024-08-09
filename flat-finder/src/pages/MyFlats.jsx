import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import FlatCard from '../components/FlatCard';
import { useAuth } from '../hooks/useAuth';
import { Container, Paper, Grid, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const MyFlats = () => {
  const { user } = useAuth();
  const [flats, setFlats] = useState([]);

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

  const handleDelete = (flatId) => {
    setFlats(flats.filter(flat => flat.id !== flatId));
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
            <Grid item xs={12} sm={6} md={4} key={flat.id}>
              <FlatCard flat={flat} onDelete={handleDelete} onToggleFavorite={handleToggleFavorite} />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
};

export default MyFlats;