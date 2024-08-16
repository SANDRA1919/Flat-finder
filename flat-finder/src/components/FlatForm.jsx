import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import {
  Container,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const FlatForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [flat, setFlat] = useState({
    city: '',
    streetName: '',
    streetNumber: '',
    rentPrice: '',
    areaSize: '',
    yearBuilt: '',
    dateAvailable: '',
    hasAC: false,
  });

  useEffect(() => {
    if (id) {
      const fetchFlat = async () => {
        const flatDoc = await getDoc(doc(db, 'flats', id));
        if (flatDoc.exists()) {
          setFlat(flatDoc.data());
        }
      };
      fetchFlat();
    }
  }, [id]);

  const handleChange = (e) => {
    setFlat({
      ...flat,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await updateDoc(doc(db, 'flats', id), { ...flat, ownerId: user.uid });
        toast.success('Flat updated successfully');
      } else {
        await addDoc(collection(db, 'flats'), { ...flat, ownerId: user.uid, favorites: [] });
        toast.success('Flat added successfully');
      }
      navigate('/');
    } catch (error) {
      toast.error('Error submitting flat');
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>{id ? 'Edit Flat' : 'Add Flat'}</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="City"
          name="city"
          value={flat.city}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Street Name"
          name="streetName"
          value={flat.streetName}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Street Number"
          name="streetNumber"
          value={flat.streetNumber}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Rent Price"
          name="rentPrice"
          type="number"
          value={flat.rentPrice}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Area Size"
          name="areaSize"
          type="number"
          value={flat.areaSize}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Year Built"
          name="yearBuilt"
          type="number"
          value={flat.yearBuilt}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Date Available"
          name="dateAvailable"
          type="date"
          value={flat.dateAvailable}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={flat.hasAC}
              onChange={handleChange}
              name="hasAC"
              color="primary"
            />
          }
          label="Has AC"
        />
        <Box mt={2}>
          <Button type="submit" variant="contained" color="primary" fullWidth>{id ? 'Update' : 'Add'} Flat</Button>
        </Box>
      </form>
    </Container>
  );
};

export default FlatForm;
