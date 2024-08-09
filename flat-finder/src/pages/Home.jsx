// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Typography, TextField, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SendIcon from '@mui/icons-material/Send';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user } = useAuth();
  const [flats, setFlats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlats = async () => {
      const flatsCollection = collection(db, 'flats');
      const flatsSnapshot = await getDocs(flatsCollection);
      const flatsList = flatsSnapshot.docs.map(doc => {
        const data = doc.data();
        if (data.dateAvailable && data.dateAvailable.toDate) {
          data.dateAvailable = data.dateAvailable.toDate().toDateString();
        } else {
          data.dateAvailable = new Date(data.dateAvailable).toDateString();
        }
        return { id: doc.id, ...data };
      });
      setFlats(flatsList);
    };

    fetchFlats();
  }, []);

  const handleDelete = async (flatId) => {
    try {
      await deleteDoc(doc(db, 'flats', flatId));
      setFlats(flats.filter(flat => flat.id !== flatId));
      toast.success('Flat deleted successfully');
    } catch (error) {
      toast.error('Error deleting flat');
    }
  };

  const handleToggleFavorite = async (flatId) => {
    try {
      const flatRef = doc(db, 'flats', flatId);
      const flat = flats.find(flat => flat.id === flatId);
      if (flat.favorites && flat.favorites.includes(user.uid)) {
        await updateDoc(flatRef, {
          favorites: arrayRemove(user.uid),
        });
        setFlats(flats.map(flat => flat.id === flatId ? { ...flat, favorites: flat.favorites.filter(uid => uid !== user.uid) } : flat));
      } else {
        await updateDoc(flatRef, {
          favorites: arrayUnion(user.uid),
        });
        setFlats(flats.map(flat => flat.id === flatId ? { ...flat, favorites: [...flat.favorites, user.uid] } : flat));
      }
      toast.success('Favorite status updated');
    } catch (error) {
      toast.error('Error updating favorite status');
    }
  };

  const handleSendMessage = (flatId) => {
    navigate(`/send-message/${flatId}`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (type) => {
    setSortType(type);
    let sortedFlats = [...flats];
    if (type === 'price') {
      sortedFlats.sort((a, b) => a.rentPrice - b.rentPrice);
    } else if (type === 'area') {
      sortedFlats.sort((a, b) => a.areaSize - b.areaSize);
    } else if (type === 'city') {
      sortedFlats.sort((a, b) => a.city.localeCompare(b.city));
    }
    setFlats(sortedFlats);
  };

  const filteredFlats = flats.filter(flat => 
    flat.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flat.streetName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container component="main" maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>Available Flats</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField 
          label="Search" 
          variant="outlined" 
          value={searchTerm} 
          onChange={handleSearchChange}
          sx={{ width: '30%' }}
        />
        <Box>
          <Button onClick={() => handleSort('price')} variant="contained" sx={{ mx: 1 }}>Sort by Price</Button>
          <Button onClick={() => handleSort('area')} variant="contained" sx={{ mx: 1 }}>Sort by Area</Button>
          <Button onClick={() => handleSort('city')} variant="contained" sx={{ mx: 1 }}>Sort by City</Button>
        </Box>
      </Box>
      <Paper elevation={3} sx={{ p: 3, mt: 3, border: '2px solid green', borderRadius: '8px' }}>
        <TableContainer component={Paper} sx={{ border: '1px solid green', borderRadius: '4px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2em' }}>City</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2em' }}>Street</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2em' }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2em' }}>Area</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2em' }}>Available Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2em' }}>Favorite</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2em' }}>Delete</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2em' }}>Send Message</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFlats.map((flat) => (
                <TableRow key={flat.id}>
                  <TableCell>{flat.city}</TableCell>
                  <TableCell>{flat.streetName}</TableCell>
                  <TableCell>{flat.rentPrice}</TableCell>
                  <TableCell>{flat.areaSize}</TableCell>
                  <TableCell>{flat.dateAvailable}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleToggleFavorite(flat.id)}>
                      {flat.favorites && flat.favorites.includes(user.uid) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDelete(flat.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleSendMessage(flat.id)} startIcon={<SendIcon />} variant="contained" color="primary">
                      Send Message
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default Home;
