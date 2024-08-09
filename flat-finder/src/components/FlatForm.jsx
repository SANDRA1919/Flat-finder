import React, { useState, useEffect } from 'react';
import { TextField, Button, Checkbox, FormControlLabel, Box } from '@mui/material';

const FlatForm = ({ flat, onSubmit }) => {
  const [formValues, setFormValues] = useState({
    city: '',
    streetName: '',
    streetNumber: '',
    areaSize: '',
    hasAC: false,
    yearBuilt: '',
    rentPrice: '',
    dateAvailable: ''
  });

  useEffect(() => {
    if (flat) {
      setFormValues({
        city: flat.city || '',
        streetName: flat.streetName || '',
        streetNumber: flat.streetNumber || '',
        areaSize: flat.areaSize || '',
        hasAC: flat.hasAC || false,
        yearBuilt: flat.yearBuilt || '',
        rentPrice: flat.rentPrice || '',
        dateAvailable: flat.dateAvailable || ''
      });
    }
  }, [flat]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formValues);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <TextField
        name="city"
        label="City"
        value={formValues.city}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        name="streetName"
        label="Street Name"
        value={formValues.streetName}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        name="streetNumber"
        label="Street Number"
        value={formValues.streetNumber}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        name="areaSize"
        label="Area Size"
        value={formValues.areaSize}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={formValues.hasAC}
            onChange={handleChange}
            name="hasAC"
            color="primary"
          />
        }
        label="Has AC"
        sx={{ mb: 2 }}
      />
      <TextField
        name="yearBuilt"
        label="Year Built"
        value={formValues.yearBuilt}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        name="rentPrice"
        label="Rent Price"
        value={formValues.rentPrice}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        name="dateAvailable"
        label="Date Available"
        type="date"
        value={formValues.dateAvailable}
        onChange={handleChange}
        fullWidth
        required
        InputLabelProps={{ shrink: true }}
        sx={{ mb: 2 }}
      />
      <Button type="submit" variant="contained" color="primary">
        Save
      </Button>
    </Box>
  );
};

export default FlatForm;