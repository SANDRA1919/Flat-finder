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
  Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'city', direction: 'asc' });

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
    try {
      const flatRef = doc(db, 'flats', flatId);
      await updateDoc(flatRef, {
        favorites: arrayRemove(user.uid),
      });
      setFavorites(favorites.filter(fav => fav.id !== flatId));
    } catch (error) {
      console.error('Error removing favorite:', error);
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
                <TableCell><Typography variant="h6" fontWeight="bold">Remove Favorite</Typography></TableCell>
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
      </Paper>
    </Container>
  );
};

export default Favorites;
