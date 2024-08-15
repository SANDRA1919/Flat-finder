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
    <Container component="main" maxWidth="lg">
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
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>City: {flat.city}</Typography>
                  <Typography variant="subtitle1" gutterBottom>Street Name: {flat.streetName}</Typography>
                  <Typography variant="subtitle1" gutterBottom>Street Number: {flat.streetNumber}</Typography>
                  <Typography variant="body1">Price: {flat.rentPrice}</Typography>
                  <Typography variant="body1">Area: {flat.areaSize}</Typography>
                  <Typography variant="body1">Year Built: {flat.yearBuilt}</Typography>
                  <Typography variant="body1">Available Date: {flat.dateAvailable}</Typography>
                </CardContent>
                <CardActions>
                  <IconButton onClick={() => handleToggleFavorite(flat.id)}>
                    {flat.favorites && flat.favorites.includes(user.uid) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                  {flat.ownerId === user.uid && (
                    <IconButton onClick={() => handleDelete(flat.id)}>
                      <DeleteIcon />
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
        <Paper elevation={3} sx={{ p: 3, mt: 3, border: '2px solid green', borderRadius: '8px' }}>
          <TableContainer component={Paper} sx={{ border: '1px solid green', borderRadius: '4px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2em' }}>City</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2em' }}>Street Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2em' }}>Street Number</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2em' }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2em' }}>Area</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2em' }}>Year Built</TableCell>
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
                    <TableCell>{flat.streetNumber}</TableCell>
                    <TableCell>{flat.rentPrice}</TableCell>
                    <TableCell>{flat.areaSize}</TableCell>
                    <TableCell>{flat.yearBuilt}</TableCell>
                    <TableCell>{flat.dateAvailable}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleToggleFavorite(flat.id)}>
                        {flat.favorites && flat.favorites.includes(user.uid) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      {flat.ownerId === user.uid && (
                        <IconButton onClick={() => handleDelete(flat.id)}>
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                    <TableCell>
                      {flat.ownerId !== user.uid && (
                        <Button onClick={() => handleSendMessage(flat.id)} startIcon={<SendIcon />} variant="contained" color="primary">
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
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Confirmation"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this flat?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Home;
