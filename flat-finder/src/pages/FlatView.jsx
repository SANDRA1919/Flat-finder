import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { Container, Paper, Typography, Box } from '@mui/material';

const FlatView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [flat, setFlat] = useState(null);

  useEffect(() => {
    const fetchFlat = async () => {
      const flatDoc = await getDoc(doc(db, 'flats', id));
      if (flatDoc.exists()) {
        const flatData = flatDoc.data();
        // Convert timestamp to string
        flatData.dateAvailable = flatData.dateAvailable.toDate().toDateString();
        setFlat(flatData);
      } else {
        console.error('Flat not found');
      }
    };

    fetchFlat();
  }, [id]);

  return flat ? (
    <Container component="main" maxWidth="md">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mt: 3, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '400px', 
          border: '2px solid green', 
          boxShadow: '0 4px 8px rgba(0, 128, 0, 0.2)', // Verde smarald pentru border și umbră
          borderRadius: '10px' // Adăugăm colțuri rotunjite
        }}
      >
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom>City: {flat.city}</Typography>
          <Typography variant="h5">Street Name: {flat.streetName}</Typography>
          <Typography variant="h5">Street Number: {flat.streetNumber}</Typography>
          <Typography variant="h5">Rent: {flat.rentPrice}</Typography>
          <Typography variant="h5">Area: {flat.areaSize}</Typography>
          <Typography variant="h5">Year Built: {flat.yearBuilt}</Typography>
          <Typography variant="h5">Available from: {flat.dateAvailable}</Typography>
          <Typography variant="h5">Has AC: {flat.hasAC ? 'Yes' : 'No'}</Typography>
        </Box>
      </Paper>
    </Container>
  ) : <div>Loading...</div>;
};

export default FlatView;