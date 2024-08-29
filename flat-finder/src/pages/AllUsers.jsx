import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where, getCountFromServer } from 'firebase/firestore';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, IconButton, Box, Tooltip } from '@mui/material';
import { toast } from 'react-toastify';
import { Delete as DeleteIcon, AdminPanelSettings as AdminIcon } from '@mui/icons-material';
import { green, teal } from '@mui/material/colors'; // Import pentru culori personalizate

const AllUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Preluăm toți utilizatorii
        const userCollection = collection(db, 'users');
        const userSnapshot = await getDocs(userCollection);
        const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Debugging: Afișează utilizatorii preluați
        console.log('Preluat utilizatori:', userList);

        // Calculăm numărul de apartamente pentru fiecare utilizator
        const usersWithApartmentCounts = await Promise.all(userList.map(async user => {
          try {
            const apartmentQuery = query(
              collection(db, 'flats'),
              where('ownerId', '==', user.id)
            );
            const apartmentCountSnapshot = await getCountFromServer(apartmentQuery);
            
            // Debugging: Afișează numărul de apartamente pentru fiecare utilizator
            console.log(`Utilizator ${user.id} are ${apartmentCountSnapshot.count} apartamente`);

            return {
              ...user,
              apartmentsAdded: apartmentCountSnapshot.count,
            };
          } catch (error) {
            console.error(`Eroare la obținerea apartamentelor pentru utilizatorul ${user.id}:`, error); // Debugging
            return {
              ...user,
              apartmentsAdded: 0, // Setează la 0 în caz de eroare
            };
          }
        }));

        setUsers(usersWithApartmentCounts);
      } catch (error) {
        console.error('Eroare la preluarea utilizatorilor:', error); // Debugging
        toast.error('Error fetching users');
      }
    };

    fetchUsers();
  }, []);

  const handleGrantAdmin = async (id) => {
    try {
      await updateDoc(doc(db, 'users', id), { isAdmin: true });
      toast.success('Admin rights granted');
    } catch (error) {
      toast.error('Error granting admin rights');
    }
  };

  const handleRemoveUser = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', id));
      setUsers(users.filter(user => user.id !== id));
      toast.success('User removed successfully');
    } catch (error) {
      toast.error('Error removing user');
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: teal[800],
          marginBottom: 3,
          textAlign: 'center',  
        }}
      >
        Manage All Users
      </Typography>
      <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 6 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: teal[700], color: 'white' }}>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', color: green[100] }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', color: green[100] }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', color: green[100] }}>Apartments Added</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', color: green[100] }}>Manage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => (
              <TableRow
                key={user.id}
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
                }}
              >
                <TableCell
                  align="center"
                  sx={{
                    fontSize: '1.2rem', 
                    fontWeight: 'bold', 
                    color: green[800], 
                  }}
                >
                  {`${user.firstName} ${user.lastName}`}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontSize: '1.2rem', 
                    fontWeight: 'bold', 
                    color: green[800], 
                  }}
                >
                  {user.email}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontSize: '1.2rem', 
                    fontWeight: 'bold', 
                    color: green[800], 
                  }}
                >
                  {user.apartmentsAdded || 0} {/* Afișează numărul de apartamente */}
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    {!user.isAdmin && (
                      <Tooltip title="Grant Admin Rights">
                        <IconButton
                          onClick={() => handleGrantAdmin(user.id)}
                          color="success"
                          sx={{
                            '&:hover': {
                              backgroundColor: green[100],
                              transition: 'background-color 0.3s ease',
                            },
                          }}
                        >
                          <AdminIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Remove User">
                      <IconButton
                        onClick={() => handleRemoveUser(user.id)}
                        color="error"
                        sx={{
                          '&:hover': {
                            backgroundColor: '#ffdddd',
                            transition: 'background-color 0.3s ease',
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default AllUsers;
