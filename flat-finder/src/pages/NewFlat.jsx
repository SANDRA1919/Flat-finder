import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField,
   Button, 
   Container, 
   Typography, 
   FormControlLabel, 
   Checkbox, 
   Paper, 
   Grid, 
   Box,
   Dialog, 
   DialogActions,
   DialogContentText, 
   DialogContent,
   DialogTitle
   } from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';

const NewFlat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({
    city: '',
    streetName: '',
    streetNumber: '',
    areaSize: '',
    hasAC: false,
    yearBuilt: '',
    rentPrice: '',
    dateAvailable: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };

  const handleCheckboxChange = (e) => {
    setForm({
      ...form,
      hasAC: e.target.checked
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOpenDialog(true);
}

const handleCloseDialog = () => {
  setOpenDialog(false);
};

const handleSave = async () => {
  try {
    await addDoc(collection(db, 'flats'), {
      ...form,
      ownerId: user.uid,
      streetNumber: parseInt(form.streetNumber),
      areaSize: parseFloat(form.areaSize),
      yearBuilt: parseInt(form.yearBuilt),
      rentPrice: parseFloat(form.rentPrice),
      dateAvailable: new Date(form.dateAvailable),
      hasAC: form.hasAC,
    });
    toast.success('Flat added successfully');
    navigate('/my-flats');
  } catch (error) {
    toast.error('Error adding flat');
    console.error('Error adding flat:', error);
  }
  handleCloseDialog(); // Close dialog after saving
};

  return (
    <Box
    sx={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'url(/img/favorites.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'absolute',
      top: 60,
      left: 0,
    }}
  >
    <Container maxWidth="md" >
      <Paper elevation={3} sx={{ padding: 4, marginTop: 4, backgroundColor: 'transparent', backdropFilter: "blur(10px)" }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Add New Flat
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Street Name"
                name="streetName"
                value={form.streetName}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Street Number"
                name="streetNumber"
                value={form.streetNumber}
                onChange={handleChange}
                fullWidth
                required
                type="number"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Area Size"
                name="areaSize"
                value={form.areaSize}
                onChange={handleChange}
                fullWidth
                required
                type="number"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.hasAC}
                    onChange={handleCheckboxChange}
                    name="hasAC"
                    color="primary"
                  />
                }
                label="Has AC"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Year Built"
                name="yearBuilt"
                value={form.yearBuilt}
                onChange={handleChange}
                fullWidth
                required
                type="number"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Rent Price"
                name="rentPrice"
                value={form.rentPrice}
                onChange={handleChange}
                fullWidth
                required
                type="number"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date Available"
                name="dateAvailable"
                value={form.dateAvailable}
                onChange={handleChange}
                fullWidth
                required
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <Box mt={4}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Add Flat
            </Button>
          </Box>
        </Box>
      </Paper>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{"Save Flat"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to save this flat?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" autoFocus>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </Box>
  );
};

export default NewFlat;