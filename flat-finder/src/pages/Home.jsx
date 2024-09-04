import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Box,
  useMediaQuery,
  useTheme,
  Dialog, 
  DialogActions,
  DialogContentText, 
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { FaHeart, FaRegHeart } from 'react-icons/fa';  // Iconițe pentru inimă
import { MdDelete } from 'react-icons/md';              // Iconiță pentru coșul de gunoi
import SendIcon from '@mui/icons-material/Send';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user } = useAuth();
  const [flats, setFlats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFlatId, setSelectedFlatId] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery('(max-width: 1024px)');

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

  const handleDelete = (flatId) => {
    setSelectedFlatId(flatId);
    setOpenDialog(true);
  };
  
  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'flats', selectedFlatId));
      setFlats(flats.filter(flat => flat.id !== selectedFlatId));
      toast.success('Flat deleted successfully');
      setOpenDialog(false);
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
    const isAsc = sortType === type && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortType(type);

    let sortedFlats = [...flats];
    if (type === 'price') {
      sortedFlats.sort((a, b) => isAsc ? b.rentPrice - a.rentPrice : a.rentPrice - b.rentPrice);
    } else if (type === 'area') {
      sortedFlats.sort((a, b) => isAsc ? b.areaSize - a.areaSize : a.areaSize - b.areaSize);
    } else if (type === 'city') {
      sortedFlats.sort((a, b) => isAsc ? b.city.localeCompare(a.city) : a.city.localeCompare(b.city));
    }
    setFlats(sortedFlats);
  };

  const filteredFlats = flats.filter(flat =>
    flat.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flat.streetName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
<Box
  sx={{
    minHeight: '100vh',
    width: '100vw', // Ensures full-width coverage
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: 'url(/img/home2.jpg)', // Path to your background image
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'absolute', // Ensure the image covers the whole viewport
    top: 60,
    left: 0,
  }}
>
    <Container component="main" maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>Available Flats</Typography>

      <Grid container spacing={isSmallScreen ? 2 : 3} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Search"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Button
                onClick={() => handleSort('price')}
                variant="contained"
                fullWidth
              >
                Sort by Price ({sortOrder === 'asc' && sortType === 'price' ? '↑' : '↓'})
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                onClick={() => handleSort('area')}
                variant="contained"
                fullWidth
              >
                Sort by Area ({sortOrder === 'asc' && sortType === 'area' ? '↑' : '↓'})
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                onClick={() => handleSort('city')}
                variant="contained"
                fullWidth
              >
                Sort by City ({sortOrder === 'asc' && sortType === 'city' ? '↑' : '↓'})
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {isMediumScreen ? (
        <Grid container spacing={2}>
          {filteredFlats.map(flat => (
            <Grid item xs={12} key={flat.id}>
              <Card sx={{ mb: 2, backgroundColor: 'transparent', backdropFilter: 'blur(10px)', }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>City: {flat.city}</Typography>
                  <Typography variant="subtitle1" gutterBottom>Street Name: {flat.streetName}</Typography>
                  <Typography variant="subtitle1" gutterBottom>Street Number: {flat.streetNumber}</Typography>
                  <Typography variant="body1">Price: {flat.rentPrice}</Typography>
                  <Typography variant="body1">Area: {flat.areaSize}</Typography>
                  <Typography variant="body1">Year Built: {flat.yearBuilt}</Typography>
                  <Typography variant="body1">Available Date: {flat.dateAvailable}</Typography>
                  <Typography variant="body1">Has AC: {flat.hasAC ? 'Yes' : 'No'}</Typography>
                </CardContent>
                <CardActions>
                  <IconButton onClick={() => handleToggleFavorite(flat.id)}>
                    {flat.favorites && flat.favorites.includes(user.uid) ? <FaHeart /> : <FaRegHeart />}
                  </IconButton>
                  {flat.ownerId === user.uid && (
                    <IconButton onClick={() => handleDelete(flat.id)}>
                      <MdDelete />
                    </IconButton>
                  )}
                  {flat.ownerId !== user.uid && (
                    <Button onClick={() => handleSendMessage(flat.id)} startIcon={<SendIcon />} variant="contained" color="primary">
                      Send Message
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper elevation={3} sx={{ p: 3, mt: 3, border: '2px solid green', borderRadius: '8px', backgroundColor: 'transparent', backdropFilter: 'blur(10px)', }}>
          <TableContainer component={Paper} sx={{ border: '1px solid green', borderRadius: '4px', backgroundColor: 'transparent', backdropFilter: 'blur(10px)', }}>
            <Table >
              <TableHead>
                <TableRow >
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9em'}}>City</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9em'}}>Street Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9em'}}>Street Number</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9em'}}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9em'}}>Area</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9em'}}>Year Built</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9em'}}>Available Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9em'}}>Has AC</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9em'}}>Fav/Unfav</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFlats.map(flat => (
                  <TableRow key={flat.id}                
                   sx={{
                    '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                    '&:nth-of-type(even)': { backgroundColor: '#ffffff' },
                    '&:hover': {
                      backgroundColor: '#e0e0e0',
                      transition: 'background-color 0.3s ease', 
                    },
                      transition: 'transform 0.2s ease', 
                      transform: 'scale(1)', 
                      '&:hover': {
                        transform: 'scale(1.02)', 
                      },
                  }}>
                    <TableCell>{flat.city}</TableCell>
                    <TableCell>{flat.streetName}</TableCell>
                    <TableCell>{flat.streetNumber}</TableCell>
                    <TableCell>{flat.rentPrice}</TableCell>
                    <TableCell>{flat.areaSize}</TableCell>
                    <TableCell>{flat.yearBuilt}</TableCell>
                    <TableCell>{flat.dateAvailable}</TableCell>
                    <TableCell>{flat.hasAC ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleToggleFavorite(flat.id)}>
                        {flat.favorites && flat.favorites.includes(user.uid) ? <FaHeart /> : <FaRegHeart />}
                      </IconButton>
                      {flat.ownerId === user.uid && (
                        <IconButton onClick={() => handleDelete(flat.id)}>
                          <MdDelete />
                        </IconButton>
                      )}
                      {flat.ownerId !== user.uid && (
                        <Button
                          onClick={() => handleSendMessage(flat.id)}
                          startIcon={<SendIcon />}
                          variant="contained"
                          color="primary"
                          sx={{ marginLeft: "75px"}} // Pushes button to the right
                        >
                          Send Message
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this flat?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">Cancel</Button>
          <Button onClick={confirmDelete} color="secondary">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
    </Box>
  );
};

export default Home;
