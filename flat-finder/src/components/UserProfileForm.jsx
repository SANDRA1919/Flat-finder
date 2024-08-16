import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

const UserProfileForm = ({ user, onSuccess }) => {
  const [profile, setProfile] = useState(user);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'users', user.uid), profile);
      toast.success('Profile updated successfully');
      onSuccess();
    } catch (error) {
      toast.error('Error updating profile');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField name="firstName" label="First Name" value={profile.firstName} onChange={handleChange} required />
      <TextField name="lastName" label="Last Name" value={profile.lastName} onChange={handleChange} required />
      <TextField name="email" label="Email" value={profile.email} onChange={handleChange} required type="email" />
      <TextField name="birthDate" label="Birth Date" value={profile.birthDate} onChange={handleChange} required type="date" InputLabelProps={{ shrink: true }} />
      <Button type="submit" variant="contained" color="primary">Update</Button>
    </form>
  );
};

export default UserProfileForm;
