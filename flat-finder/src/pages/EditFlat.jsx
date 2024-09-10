import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import FlatForm from '../components/FlatForm';
import { toast } from 'react-toastify';
import { 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  Button, 
  Box, 
  Container } from '@mui/material';

const EditFlat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flat, setFlat] = useState(null);
  const [updatedFlat, setUpdatedFlat] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchFlat = async () => {
      try {
        const flatDoc = await getDoc(doc(db, 'flats', id));
        if (flatDoc.exists()) {
          setFlat(flatDoc.data());
        } else {
          toast.error('Flat not found');
          navigate('/');
        }
      } catch (error) {
        toast.error('Error fetching flat');
      }
    };

    fetchFlat();
  }, [id, navigate]);

  const handleFormSubmit = (data) => {
    setUpdatedFlat(data);
    setOpenDialog(true);
  };

  const handleUpdate = async () => {
    try {
      await updateDoc(doc(db, 'flats', id), updatedFlat);
      toast.success('Flat updated successfully');
      navigate('/my-flats');
    } catch (error) {
      toast.error('Error updating flat');
    } finally {
      setOpenDialog(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
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
    <Container maxWidth= 'md' sx = {{backgroundColor: 'transparent', backdropFilter: "blur(10px)"}}>
      {flat ? <FlatForm   flat={flat} onSubmit={handleFormSubmit} /> : <div>Loading...</div>}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Update</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to save the changes to this flat?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUpdate} color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
   </Box>
  );
};

export default EditFlat;
