// src/components/FlatCard.jsx
import React from 'react';
import { Card, CardContent, Typography, Button, CardActions } from '@mui/material';
import { Favorite, FavoriteBorder, Delete, Edit, Visibility } from '@mui/icons-material';
import { doc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const FlatCard = ({ flat, onDelete, onToggleFavorite }) => {
  const { user } = useAuth();

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'flats', flat.id));
      onDelete(flat.id);
    } catch (error) {
      console.error('Error deleting flat:', error);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const flatRef = doc(db, 'flats', flat.id);
      if (flat.favorites && flat.favorites.includes(user.uid)) {
        await updateDoc(flatRef, {
          favorites: arrayRemove(user.uid),
        });
      } else {
        await updateDoc(flatRef, {
          favorites: arrayUnion(user.uid),
        });
      }
      onToggleFavorite(flat.id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <Card sx={{ borderColor: 'green', backgroundColor: 'lightgreen', borderRadius: '8px', boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5">City: {flat.city}</Typography>
        <Typography variant="body2">Street name: {flat.streetName}</Typography>
        <Typography variant="body2">Rent: {flat.rentPrice}</Typography>
        <Typography variant="body2">Area: {flat.areaSize}</Typography>
      </CardContent>
      <CardActions>
        <Button onClick={handleToggleFavorite} startIcon={flat.favorites && flat.favorites.includes(user.uid) ? <Favorite /> : <FavoriteBorder />}>
          {flat.favorites && flat.favorites.includes(user.uid) ? 'Unfav' : 'Fav'}
        </Button>
        <Button onClick={handleDelete} startIcon={<Delete />}>
          Delete
        </Button>
        <Button component={Link} to={`/edit-flat/${flat.id}`} startIcon={<Edit />}>
          Edit
        </Button>
        <Button component={Link} to={`/flat/${flat.id}`} startIcon={<Visibility />}>
          View
        </Button>
       
      </CardActions>
    </Card>
  );
};

export default FlatCard;
