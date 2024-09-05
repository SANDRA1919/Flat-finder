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
  TableSortLabel,
  Box,
  useMediaQuery,
  useTheme,
  Dialog, 
  DialogActions,
  DialogContentText, 
  DialogContent,
  DialogTitle,
  TextField, // Import TextField for search bar
} from '@mui/material';
import { FaHeart, FaRegHeart } from 'react-icons/fa';  
import { MdDelete } from 'react-icons/md';              
import SendIcon from '@mui/icons-material/Send';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user } = useAuth();
  const [flats, setFlats] = useState([]);
  const [sortType, setSortType] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFlatId, setSelectedFlatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const navigate = useNavigate();
  const theme = useTheme();
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

  const handleSort = (type) => {
    const isAsc = sortType === type && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortType(type);
  
    let sortedFlats = [...flats];
    if (type === 'rentPrice') {
      sortedFlats.sort((a, b) => isAsc ? b.rentPrice - a.rentPrice : a.rentPrice - b.rentPrice);
    } else if (type === 'areaSize') {
      sortedFlats.sort((a, b) => isAsc ? b.areaSize - a.areaSize : a.areaSize - b.areaSize);
    } else if (type === 'city') {
      sortedFlats.sort((a, b) => isAsc ? b.city.localeCompare(a.city) : a.city.localeCompare(b.city));
    } else if (type === 'streetNumber') {
      sortedFlats.sort((a, b) => isAsc ? b.streetNumber - a.streetNumber : a.streetNumber - b.streetNumber);
    } else if (type === 'yearBuilt') {
      sortedFlats.sort((a, b) => isAsc ? b.yearBuilt - a.yearBuilt : a.yearBuilt - b.yearBuilt);
    } else if (type === 'availableDate') {
      sortedFlats.sort((a, b) => {
        // Ensure that `availableDate` is converted to a valid date
        const dateA = new Date(a.availableDate);
        const dateB = new Date(b.availableDate);
        // Check if the dates are valid
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          console.error('Invalid date:', a.availableDate, b.availableDate);
        }
        return isAsc ? dateA - dateB : dateB - dateA;
      });
    } else if (type === 'hasAC') {
      sortedFlats.sort((a, b) => {
        const hasAC_A = a.hasAC ? 1 : 0;
        const hasAC_B = b.hasAC ? 1 : 0;
        return isAsc ? hasAC_A - hasAC_B : hasAC_B - hasAC_A;
      });
    }
    setFlats(sortedFlats);
  };
  
  

  // Filter flats based on search query
  const filteredFlats = flats.filter(flat => 
    (flat.city ? flat.city.toLowerCase().includes(searchQuery.toLowerCase()) : '') ||
    (flat.streetName ? flat.streetName.toLowerCase().includes(searchQuery.toLowerCase()) : '') ||
    (flat.streetNumber ? flat.streetNumber.toString().toLowerCase().includes(searchQuery.toLowerCase()) : '') ||
    (flat.rentPrice ? flat.rentPrice.toString().toLowerCase().includes(searchQuery.toLowerCase()) : '') ||
    (flat.areaSize ? flat.areaSize.toString().toLowerCase().includes(searchQuery.toLowerCase()) : '') ||
    (flat.yearBuilt ? flat.yearBuilt.toString().toLowerCase().includes(searchQuery.toLowerCase()) : '') ||
    (flat.dateAvailable ? flat.dateAvailable.toLowerCase().includes(searchQuery.toLowerCase()) : '')
  );
  

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/img/home2.jpg)', 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'absolute',
        top: 60,
        left: 0,
      }}
    >
      <Container component="main" maxWidth="xl">
        <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>Available Flats</Typography>
        <TextField
          label="Search"
          variant="outlined"
          fullWidth
          margin="normal"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Paper elevation={3} sx={{ borderRadius: '8px', backgroundColor: 'transparent', backdropFilter: 'blur(10px)'}}>
          <TableContainer component={Paper} sx={{ p: 3, borderRadius: '4px', backgroundColor: 'transparent', backdropFilter: 'blur(10px)'}}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortType === 'city'}
                      direction={sortOrder}
                      onClick={() => handleSort('city')}
                    >
                      City
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortType === 'streetName'}
                      direction={sortOrder}
                      onClick={() => handleSort('streetName')}
                    >
                      Street Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                  <TableSortLabel
                      active={sortType === 'streetNumber'}
                      direction={sortOrder}
                      onClick={() => handleSort('streetNumber')}
                    >
                      Street Number
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortType === 'rentPrice'}
                      direction={sortOrder}
                      onClick={() => handleSort('rentPrice')}
                    >
                      Price
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortType === 'areaSize'}
                      direction={sortOrder}
                      onClick={() => handleSort('areaSize')}
                    >
                      Area
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                  <TableSortLabel
                      active={sortType === 'yearBuilt'}
                      direction={sortOrder}
                      onClick={() => handleSort('yearBuilt')}
                    >
                      Year Built
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                  <TableSortLabel
                      active={sortType === 'availableDate'}
                      direction={sortOrder}
                      onClick={() => handleSort('availableDate')}
                    >
                      Available Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                  <TableSortLabel
                      active={sortType === 'hasAC'}
                      direction={sortOrder}
                      onClick={() => handleSort('hasAC')}
                    >
                      Has AC
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Fav/Unfav</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFlats.map((flat) => (
                  <TableRow key={flat.id}
                  sx={{
                    '&:nth-of-type(odd)': { backgroundColor: 'transparent' },
                    '&:nth-of-type(even)': { backgroundColor: 'transparent' },
                    '&:hover': {
                      backgroundColor: 'transparent',
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
