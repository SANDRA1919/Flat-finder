// src/pages/Inbox.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { Container, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@mui/material';
import { toast } from 'react-toastify';

const Inbox = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (user) {
        const messagesQuery = query(collection(db, 'messages'), where('recipientId', '==', user.uid));
        const messagesSnapshot = await getDocs(messagesQuery);
        const messagesList = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(messagesList);
      }
    };

    fetchMessages();
  }, [user]);

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
  };

  const handleCloseMessage = () => {
    setSelectedMessage(null);
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteDoc(doc(db, 'messages', messageId));
      setMessages(messages.filter(message => message.id !== messageId));
      toast.success('Message deleted successfully');
    } catch (error) {
      toast.error('Error deleting message');
      console.error('Error deleting message:', error);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3, mt: 3, border: '2px solid green', borderRadius: '8px' }}>
        <Typography variant="h5" gutterBottom>Inbox</Typography>
        {messages.length > 0 ? (
          messages.map((message) => (
            <Paper key={message.id} sx={{ p: 2, mt: 2, border: '1px solid green', borderRadius: '4px' }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>From: {message.senderEmail}</Typography>
              <Typography variant="body2" noWrap>{message.content}</Typography>
              <Box sx={{ mt: 2 }}>
                <Button variant="outlined" onClick={() => handleViewMessage(message)} sx={{ mr: 1 }}>View</Button>
                <Button variant="contained" color="error" onClick={() => handleDeleteMessage(message.id)}>Delete</Button>
              </Box>
            </Paper>
          ))
        ) : (
          <Typography variant="body1">No messages</Typography>
        )}

        <Dialog open={!!selectedMessage} onClose={handleCloseMessage}>
          <DialogTitle>Message from {selectedMessage?.senderEmail}</DialogTitle>
          <DialogContent>
            <Typography>{selectedMessage?.content}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseMessage}>Close</Button>
            <Button onClick={() => handleDeleteMessage(selectedMessage.id)} color="error">Delete</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default Inbox;
