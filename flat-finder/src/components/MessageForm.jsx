import React, { useState } from 'react';
import { Button, TextField, Stack } from '@mui/material';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const MessageForm = ({ flatId, recipientId, senderId, senderEmail }) => {
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    if (message.trim() === '') return;

    const timestamp = new Date(); // Current date and time

    try {
      await addDoc(collection(db, 'messages'), {
        flatId,
        recipientId,
        senderId,
        senderEmail,
        message,
        timestamp: timestamp.toISOString(), // Save timestamp as ISO string
        isRead: false // Messages are initially unread
      });
      setMessage(''); // Clear message input after sending
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };

  return (
    <Stack spacing={2}>
      <TextField
        label="Message"
        variant="outlined"
        fullWidth
        multiline
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={handleSend}>
        Send
      </Button>
    </Stack>
  );
};

export default MessageForm;
