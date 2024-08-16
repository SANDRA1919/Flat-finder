import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { Container, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@mui/material';
import { toast } from 'react-toastify';
import DeleteIcon from '@mui/icons-material/Delete';

const Inbox = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

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

  const handleOpenDeleteDialog = (messageId) => {
    setMessageToDelete(messageId);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setMessageToDelete(null);
  };

  const handleDeleteMessage = async () => {
    try {
      await deleteDoc(doc(db, 'messages', messageToDelete));
      setMessages(messages.filter(message => message.id !== messageToDelete));
      toast.success('Message deleted successfully');
      handleCloseDeleteDialog();
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
                <Button 
                  variant="contained" 
                  color="error" 
                  startIcon={<DeleteIcon />} 
                  onClick={() => handleOpenDeleteDialog(message.id)}
                >
                  Delete
                </Button>
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
          </DialogActions>
        </Dialog>

        <Dialog
          open={openDeleteDialog}
          onClose={handleCloseDeleteDialog}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title" sx={{ color: 'red' }}>
            Confirm Delete
          </DialogTitle>
          <DialogContent>
            <Typography id="delete-dialog-description">
              Are you sure you want to delete this message? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} variant="outlined">
              Cancel
            </Button>
            <Button onClick={handleDeleteMessage} variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default Inbox;
