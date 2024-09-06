import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, arrayRemove } from 'firebase/firestore';
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
  IconButton,
  TableSortLabel,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  useMediaQuery,
  Button,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContentText,
  DialogContent,
  DialogTitle,
  Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'city', direction: 'asc' });
  const [openDialog, setOpenDialog] = useState(false);
  const [flatToRemove, setFlatToRemove] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchFavorites = async () => {
      if (user) {
        const favQuery = query(collection(db, 'flats'), where('favorites', 'array-contains', user.uid));
        const favSnapshot = await getDocs(favQuery);
        const favList = favSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFavorites(favList);
      }
    };

    fetchFavorites();
  }, [user]);

  const handleRemoveFavorite = (flatId) => {
    setFlatToRemove(flatId);
    setOpenDialog(true);
  };

  const handleConfirmRemoval = async () => {
    if (flatToRemove) {
      try {
        const flatRef = doc(db, 'flats', flatToRemove);
        await updateDoc(flatRef, {
          favorites: arrayRemove(user.uid),
        });
        setFavorites(favorites.filter(fav => fav.id !== flatToRemove));
        setOpenDialog(false);
      } catch (error) {
        console.error('Error removing favorite:', error);
      }
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Modificare: Pregătirea datelor pentru afișare, cu verificarea `dateAvailable`
  const formattedFavorites = favorites.map(flat => ({
    ...flat,
    dateAvailable: flat.dateAvailable && typeof flat.dateAvailable.toDate === 'function'
      ? flat.dateAvailable.toDate().toDateString()
      : new Date(flat.dateAvailable).toDateString()
  }));

  const sortedFavorites = [...formattedFavorites].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return (
    <Box
    sx={{
      minHeight: '100vh',
      width: '100vw', // Ensures full-width coverage
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'url(/img/myflats.jpg)', 
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'absolute', // Ensure the image covers the whole viewport
      top: 60,
      left: 0,
    }}
  >
    <Container component="main" maxWidth="xl">
      <Paper maxWidth = 'xl'  sx={{ width: '100%',  backgroundColor: 'transparent', backdropFilter: 'blur(10px)', }}>
        {isMobile ? (
          <>
            <FormControl  margin="normal">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortConfig.key}
                onChange={(e) => handleSort(e.target.value)}
              >
                <MenuItem value="city">City</MenuItem>
                <MenuItem value="streetName">Street Name</MenuItem>
                <MenuItem value="streetNumber">Street Number</MenuItem>
                <MenuItem value="rentPrice">Price</MenuItem>
                <MenuItem value="areaSize">Area</MenuItem>
                <MenuItem value="dateAvailable">Available Date</MenuItem>
                <MenuItem value="hasAC">Has AC</MenuItem>
              </Select>
            </FormControl>
            <Grid container spacing={2}>
              {sortedFavorites.map((flat) => (
                <Grid item xs={12} key={flat.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6"><strong>City:</strong> {flat.city}</Typography>
                      <Typography variant="h6"><strong>Street:</strong> {flat.streetName} {flat.streetNumber}</Typography>
                      <Typography variant="h6"><strong>Price:</strong> {flat.rentPrice}</Typography>
                      <Typography variant="h6"><strong>Area:</strong> {flat.areaSize}</Typography>
                      <Typography variant="h6"><strong>Available Date:</strong> {flat.dateAvailable}</Typography>
                      <Typography variant="h6"><strong>Has AC:</strong> {flat.hasAC ? 'Yes' : 'No'}</Typography>
                    </CardContent>
                    <CardActions>
                      <Button onClick={() => handleRemoveFavorite(flat.id)} startIcon={<DeleteIcon />} color="error">
                        Remove Favorite
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <TableContainer component={Paper} sx={{ p: 3, borderRadius: '4px', backgroundColor: 'transparent', backdropFilter: 'blur(10px)', }}>
            <Table >
              <TableHead>
                <TableRow >
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'city'}
                      direction={sortConfig.direction}
                      onClick={() => handleSort('city')}
                    >
                      <Typography variant="h6" fontWeight="bold">City</Typography>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'streetName'}
                      direction={sortConfig.direction}
                      onClick={() => handleSort('streetName')}
                    >
                      <Typography variant="h6" fontWeight="bold">Street</Typography>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'streetNumber'}
                      direction={sortConfig.direction}
                      onClick={() => handleSort('streetNumber')}
                    >
                      <Typography variant="h6" fontWeight="bold">Street Number</Typography>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'rentPrice'}
                      direction={sortConfig.direction}
                      onClick={() => handleSort('rentPrice')}
                    >
                      <Typography variant="h6" fontWeight="bold">Price</Typography>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'areaSize'}
                      direction={sortConfig.direction}
                      onClick={() => handleSort('areaSize')}
                    >
                      <Typography variant="h6" fontWeight="bold">Area</Typography>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'dateAvailable'}
                      direction={sortConfig.direction}
                      onClick={() => handleSort('dateAvailable')}
                    >
                      <Typography variant="h6" fontWeight="bold">Available Date</Typography>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'hasAC'}
                      direction={sortConfig.direction}
                      onClick={() => handleSort('hasAC')}
                    >
                      <Typography variant="h6" fontWeight="bold">Has AC</Typography>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" fontWeight="bold">Remove Favorite</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedFavorites.map((flat) => (
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
                    <TableCell><Typography>{flat.city}</Typography></TableCell>
                    <TableCell><Typography>{flat.streetName}</Typography></TableCell>
                    <TableCell><Typography>{flat.streetNumber}</Typography></TableCell>
                    <TableCell><Typography>{flat.rentPrice}</Typography></TableCell>
                    <TableCell><Typography>{flat.areaSize}</Typography></TableCell>
                    <TableCell><Typography>{flat.dateAvailable}</Typography></TableCell>
                    <TableCell><Typography>{flat.hasAC ? 'Yes' : 'No'}</Typography></TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleRemoveFavorite(flat.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Removal"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to remove this flat from your favorites?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmRemoval} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </Box>
  );
};

export default Favorites;
