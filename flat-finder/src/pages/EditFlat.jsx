import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import FlatForm from '../components/FlatForm';
import { toast } from 'react-toastify';

const EditFlat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flat, setFlat] = useState(null);

  useEffect(() => {
    const fetchFlat = async () => {
      const flatDoc = await getDoc(doc(db, 'flats', id));
      if (flatDoc.exists()) {
        setFlat(flatDoc.data());
      } else {
        toast.error('Flat not found');
        navigate('/');
      }
    };

    fetchFlat();
  }, [id, navigate]);

  const handleUpdate = async (updatedFlat) => {
    try {
      await updateDoc(doc(db, 'flats', id), updatedFlat);
      toast.success('Flat updated successfully');
      navigate('/my-flats');
    } catch (error) {
      toast.error('Error updating flat');
    }
  };

  return flat ? <FlatForm flat={flat} onSubmit={handleUpdate} /> : <div>Loading...</div>;
};

export default EditFlat;