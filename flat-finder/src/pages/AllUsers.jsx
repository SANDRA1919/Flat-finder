// src/pages/AllUsers.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { toast } from 'react-toastify';

const AllUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const userCollection = collection(db, 'users');
      const userSnapshot = await getDocs(userCollection);
      const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
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
    <div>
      <h1>All Users</h1>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.id}>
              <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {!user.isAdmin && <Button onClick={() => handleGrantAdmin(user.id)}>Grant Admin</Button>}
                <Button onClick={() => handleRemoveUser(user.id)}>Remove</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AllUsers;
