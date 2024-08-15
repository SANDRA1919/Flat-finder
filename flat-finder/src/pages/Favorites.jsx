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
  InputLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'city', direction: 'asc' });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // For screens 1024px and smaller

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

  const handleRemoveFavorite = async (flatId) => {
    const isConfirmed = window.confirm('Are you sure you want to delete from favorites?');
    if (isConfirmed) {
      try {
        const flatRef = doc(db, 'flats', flatId);
        await updateDoc(flatRef, {
          favorites: arrayRemove(user.uid),
        });
        setFavorites(favorites.filter(fav => fav.id !== flatId));
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

  const sortedFavorites = [...favorites].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return (
    <Container component="main" maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mt: 3, border: '2px solid #4CAF50', backgroundColor: '#F0FFF0' }}>
        {isMobile ? (
          <>
            <FormControl fullWidth margin="normal">
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
                      <Typography variant="h6"><strong>Available Date:</strong> {flat.dateAvailable.toDate().toDateString()}</Typography>
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
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
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
                    <Typography variant="h6" fontWeight="bold">Remove Favorite</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedFavorites.map((flat) => (
                  <TableRow key={flat.id}>
                    <TableCell><Typography>{flat.city}</Typography></TableCell>
                    <TableCell><Typography>{flat.streetName}</Typography></TableCell>
                    <TableCell><Typography>{flat.streetNumber}</Typography></TableCell>
                    <TableCell><Typography>{flat.rentPrice}</Typography></TableCell>
                    <TableCell><Typography>{flat.areaSize}</Typography></TableCell>
                    <TableCell><Typography>{flat.dateAvailable.toDate().toDateString()}</Typography></TableCell>
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
    </Container>
  );
};

export default Favorites;
