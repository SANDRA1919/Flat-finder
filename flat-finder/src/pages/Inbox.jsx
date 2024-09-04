import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Box, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import { useAuth } from '../contexts/AuthContext'; 
import { db } from '../firebase'; 
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore'; 

const Inbox = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [openReplyDialog, setOpenReplyDialog] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      if (user) {
        try {
          const messagesQuery = query(collection(db, 'messages'), where('recipientId', '==', user.uid));
          const messagesSnapshot = await getDocs(messagesQuery);
          const messagesList = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMessages(messagesList);

          // Marchează mesajele ca citite
          const unreadMessages = messagesList.filter(msg => msg.recipientId === user.uid && !msg.isRead);
          for (const message of unreadMessages) {
            await updateDoc(doc(db, 'messages', message.id), { isRead: true });
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
          toast.error('Error fetching messages');
        }
      }
    };

    fetchMessages();
  }, [user]);

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setViewDialogOpen(true);
  };

  const handleReplyMessage = (message) => {
    setSelectedMessage(message);
    setOpenReplyDialog(true);
  };

  const handleCloseDialogs = () => {
    setSelectedMessage(null);
    setViewDialogOpen(false);
    setOpenReplyDialog(false);
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

  const handleSendReply = async () => {
    if (replyMessage.trim() === '') return;

    const timestamp = new Date();

    try {
      await addDoc(collection(db, 'messages'), {
        flatId: selectedMessage.flatId,
        recipientId: selectedMessage.senderId,
        senderId: user.uid,
        senderEmail: user.email,
        message: replyMessage,
        timestamp: timestamp.toISOString(),
        isRead: false // Messages are initially unread
      });
      setReplyMessage('');
      setOpenReplyDialog(false);
      toast.success('Reply sent successfully');
    } catch (error) {
      console.error('Error sending reply: ', error);
      toast.error('Error sending reply');
    }
  };

  return (
    <div>
      <Container
       component="main"
        maxWidth="md"
        sx={{
         minHeight: '80vh', 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 3, border: '2px solid teal', borderRadius: '12px' }}>
          <Typography variant="h4" gutterBottom align="center">Inbox</Typography>
          {messages.length > 0 ? (
            messages.map((message) => (
              <Paper key={message.id} sx={{ p: 2, mt: 2, border: '1px solid teal', borderRadius: '8px', backgroundColor: '#e0f7fa', display: 'flex', alignItems: 'center' }}>
                <Box sx={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#00796b' }}>From: {message.senderEmail}</Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      onClick={() => handleViewMessage(message)} 
                      sx={{ mr: 1, backgroundColor: '#00796b', color: '#ffffff' }}
                    >
                      View
                    </Button>
                    <Button 
                      variant="contained" 
                      color="error" 
                      startIcon={<DeleteIcon />} 
                      onClick={() => handleOpenDeleteDialog(message.id)}
                      sx={{ backgroundColor: '#d32f2f', color: '#ffffff' }}
                    >
                      Delete
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="info" 
                      startIcon={<ReplyIcon />} 
                      onClick={() => handleReplyMessage(message)}
                      sx={{ backgroundColor: '#0288d1', color: '#ffffff', ml: 1 }}
                    >
                      Reply
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ flex: '2', ml: 2 }}>
                  <Typography variant="body2" sx={{ color: '#004d40', textAlign: 'center', fontWeight: 'bold' }}>{message.message}</Typography>
                </Box>
              </Paper>
            ))
          ) : (
            <Typography variant="body1" align="center">No messages</Typography>
          )}

          {/* View Message Dialog */}
          <Dialog open={viewDialogOpen} onClose={handleCloseDialogs} fullWidth maxWidth="sm">
            <DialogTitle sx={{ backgroundColor: '#00796b', color: '#ffffff' }}>
              Message from {selectedMessage?.senderEmail}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2, color: '#004d40', textAlign: 'center', fontWeight: 'bold' }}>
                {selectedMessage?.message}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialogs} variant="outlined">Close</Button>
            </DialogActions>
          </Dialog>

          {/* Reply Message Dialog */}
          <Dialog open={openReplyDialog} onClose={handleCloseDialogs} fullWidth maxWidth="sm">
            <DialogTitle sx={{ backgroundColor: '#00796b', color: '#ffffff' }}>
              Reply to {selectedMessage?.senderEmail}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2, color: '#004d40' }}>
                {selectedMessage?.message}
              </Typography>
              <TextField
                label="Your Reply"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                sx={{ mb: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialogs} variant="outlined">Cancel</Button>
              <Button onClick={handleSendReply} variant="contained" color="primary">Send Reply</Button>
            </DialogActions>
          </Dialog>

          {/* Delete Message Dialog */}
          <Dialog
            open={openDeleteDialog}
            onClose={handleCloseDeleteDialog}
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
            fullWidth
            maxWidth="sm"
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
    </div>
  );
};

export default Inbox;
