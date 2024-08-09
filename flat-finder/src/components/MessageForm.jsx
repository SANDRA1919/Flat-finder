// src/components/MessageForm.jsx
import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import { db } from '../firebase';
import { addDoc, collection } from 'firebase/firestore';
import { toast } from 'react-toastify';

const MessageForm = ({ flatId, recipientId, senderId, senderEmail }) => {
  const [content, setContent] = useState('');

  const handleChange = (e) => {
    setContent(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content) {
      toast.error('Message content cannot be empty');
      return;
    }
    try {
      await addDoc(collection(db, 'messages'), {
        flatId,
        senderId,
        senderEmail,
        recipientId,
        content,
        creationTime: new Date()
      });
      toast.success('Message sent successfully');
      setContent('');
    } catch (error) {
      toast.error('Error sending message');
      console.error('Error sending message:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Message"
        value={content}
        onChange={handleChange}
        required
        fullWidth
        multiline
        rows={4}
      />
      <Button type="submit" variant="contained" color="primary">Send</Button>
    </form>
  );
};

export default MessageForm;
