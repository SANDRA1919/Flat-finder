import React, { useState, useEffect } from 'react';
import { 
  Container, 
  TextField, 
  Button, 
  Checkbox, 
  FormControlLabel, 
  Box, 
  Typography } from '@mui/material';

const FlatForm = ({ flat, onSubmit }) => {
  const [formState, setFormState] = useState(flat || {
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
    setFormState(flat);
  }, [flat]);

  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formState);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>{flat ? 'Edit Flat' : 'Add Flat'}</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="City"
          name="city"
          value={formState.city}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Street Name"
          name="streetName"
          value={formState.streetName}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Street Number"
          name="streetNumber"
          value={formState.streetNumber}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Rent Price"
          name="rentPrice"
          type="number"
          value={formState.rentPrice}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Area Size"
          name="areaSize"
          type="number"
          value={formState.areaSize}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Year Built"
          name="yearBuilt"
          type="number"
          value={formState.yearBuilt}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Date Available"
          name="dateAvailable"
          type="date"
          value={formState.dateAvailable}
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
              checked={formState.hasAC}
              onChange={handleChange}
              name="hasAC"
              color="primary"
            />
          }
          label="Has AC"
        />
        <Box mt={2}>
          <Button type="submit" variant="contained" color="primary" fullWidth>{flat ? 'Update' : 'Add'} Flat</Button>
        </Box>
      </form>
    </Container>
  );
};

export default FlatForm;
