import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where, getCountFromServer } from 'firebase/firestore';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, IconButton, Box, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Card, CardContent, Grid, useMediaQuery } from '@mui/material';
import { toast } from 'react-toastify';
import { Delete as DeleteIcon, AdminPanelSettings as AdminIcon } from '@mui/icons-material';
import { green, teal } from '@mui/material/colors';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogType, setDialogType] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const isMobile = useMediaQuery('(max-width: 600px)'); // For phones
  const isTablet = useMediaQuery('(max-width: 900px)'); // For tablets

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userCollection = collection(db, 'users');
        const userSnapshot = await getDocs(userCollection);
        const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const usersWithApartmentCounts = await Promise.all(userList.map(async user => {
          try {
            const apartmentQuery = query(
              collection(db, 'flats'),
              where('ownerId', '==', user.id)
            );
            const apartmentCountSnapshot = await getCountFromServer(apartmentQuery);
            return {
              ...user,
              apartmentsAdded: apartmentCountSnapshot.data().count,
            };
          } catch (error) {
            console.error(`Error fetching apartments for user ${user.id}:`, error);
            return {
              ...user,
              apartmentsAdded: 0,
            };
          }
        }));

        setUsers(usersWithApartmentCounts);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Error fetching users');
      }
    };

    fetchUsers();
  }, []);

  const handleOpenDialog = (user, type) => {
    setSelectedUser(user);
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setDialogType('');
  };

  const handleConfirmAction = async () => {
    if (dialogType === 'grantAdmin') {
      try {
        await updateDoc(doc(db, 'users', selectedUser.id), { isAdmin: true });
        toast.success('Admin rights granted');
      } catch (error) {
        toast.error('Error granting admin rights');
      }
    } else if (dialogType === 'removeUser') {
      try {
        await deleteDoc(doc(db, 'users', selectedUser.id));
        setUsers(users.filter(user => user.id !== selectedUser.id));
        toast.success('User removed successfully');
      } catch (error) {
        toast.error('Error removing user');
      }
    }

    handleCloseDialog();
  };

  return (
    <Box
    sx={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'url(/img/allusers.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'absolute',
      top: 60,
      left: 0,
    }}
  >
    <Box  sx={{ backgroundColor: 'transparent',
          backdropFilter: "blur(10px)"}}>
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
      
      {/* Render table for larger screens and cards for smaller screens */}
      {!(isMobile || isTablet)? (
  <Paper  sx={{ overflow: 'hidden', boxShadow: 6, backgroundColor: 'transparent', backdropFilter: "blur(10px)", width: '100%', maxWidth: 'xl' }}>
    <Table sx={{ minWidth: '80vw', maxWidth: '100vh', fontSize: '1rem' }}>
      <TableHead sx={{ backgroundColor: teal[700], color: 'white', height: '60px' }}>
        <TableRow sx={{ backgroundColor: teal[700], color: 'white', height: '60px' }}>
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
            sx={{ backgroundColor: 'transparent', backdropFilter: "blur(10px)",
              '&:nth-of-type(odd)': { backgroundColor: 'transparent' },
              '&:nth-of-type(even)': { backgroundColor: 'transparent' },
              '&:hover': {
                backgroundColor: '#e0e0e0',
                transition: 'background-color 0.3s ease',
              },
              transition: 'transform 0.2s ease',
              transform:'scale(1)',
              '&:hover': {
                transform:'scale(1.02)',
              },
              height: '60px'
            }}
          >
            <TableCell
              align="center"
              sx={{
                fontSize: '1rem',
                fontWeight: 'bold',
                color: green[800],
                padding: '10px',
                verticalAlign: 'middle'
              }}
            >
              {`${user.firstName} ${user.lastName}`}
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontSize: '1rem',
                fontWeight: 'bold',
                color: green[800],
                padding: '10px',
                verticalAlign: 'middle'
              }}
            >
              {user.email}
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontSize: '1rem',
                fontWeight: 'bold',
                color: green[800],
                padding: '10px',
                verticalAlign: 'middle'
              }}
            >
              {user.apartmentsAdded || 0}
            </TableCell>
            <TableCell align="center">
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                {!user.isAdmin && (
                  <Tooltip title="Grant Admin Rights">
                    <IconButton
                      onClick={() => handleOpenDialog(user, 'grantAdmin')}
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
                    onClick={() => handleOpenDialog(user,'removeUser')}
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
): (
        <Grid container spacing={2}>
          {users.map(user => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 2, boxShadow: 3,  backgroundColor: 'transparent',
          backdropFilter: "blur(10px)" }}>
                <CardContent>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    {`${user.firstName} ${user.lastName}`}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {user.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Apartments Added: {user.apartmentsAdded || 0}
                  </Typography>
                </CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, padding: 1 }}>
                  {!user.isAdmin && (
                    <Tooltip title="Grant Admin Rights">
                      <IconButton
                        onClick={() => handleOpenDialog(user, 'grantAdmin')}
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
                      onClick={() => handleOpenDialog(user, 'removeUser')}
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
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {dialogType === 'grantAdmin' ? 'Grant Admin Rights' : 'Remove User'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogType === 'grantAdmin'
              ? `Are you sure you want to grant admin rights to ${selectedUser?.firstName} ${selectedUser?.lastName}?`
              : `Are you sure you want to remove ${selectedUser?.firstName} ${selectedUser?.lastName}? This action cannot be undone.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmAction} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </Box>
  );
};

export default AllUsers;
