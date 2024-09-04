import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Box, TextField, Tabs, Tab } from '@mui/material';
import { toast } from 'react-toastify';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../contexts/AuthContext'; 
import { db } from '../firebase'; 
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore'; 

const Inbox = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [openReplyDialog, setOpenReplyDialog] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0); // State for tabs

  useEffect(() => {
    const fetchMessages = async () => {
      if (user) {
        try {
          // Fetch received messages
          const inboxQuery = query(collection(db, 'messages'), where('recipientId', '==', user.uid));
          const inboxSnapshot = await getDocs(inboxQuery);
          const inboxList = inboxSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMessages(inboxList);

          // Fetch sent messages
          const sentQuery = query(collection(db, 'messages'), where('senderId', '==', user.uid));
          const sentSnapshot = await getDocs(sentQuery);
          const sentList = sentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setSentMessages(sentList);

          // Mark received messages as read
          const unreadMessages = inboxList.filter(msg => msg.recipientId === user.uid && !msg.isRead);
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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
      setSentMessages(sentMessages.filter(message => message.id !== messageToDelete));
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
        isRead: false
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
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/img/pexels-nietjuh-1809342.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'absolute',
        top: 60,
        left: 0,
      }}
    >
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
        <Paper elevation={3} sx={{ p: 3, border: '2px solid teal', borderRadius: '12px', backgroundColor: 'transparent', backdropFilter: 'blur(10px)' }}>
          <Typography variant="h4" gutterBottom align="center" sx={{ color: 'teal' }}>Messages</Typography>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{ mb: 2 }}
          >
            <Tab label="Inbox" />
            <Tab label="Sent" />
          </Tabs>

          {tabValue === 0 && (
            <>
              {messages.length > 0 ? (
                messages.map((message) => (
                  <Paper key={message.id} sx={{ p: 2, mt: 2, border: '1px solid teal', borderRadius: '8px', backgroundColor: '#e0f7fa', display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#00796b' }}>From: {message.senderEmail}</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', mt: 1 }}>
                        <Typography variant="body2" sx={{ color: '#004d40', fontWeight: 'bold' }}>{new Date(message.timestamp).toLocaleString()}</Typography>
                        <Typography variant="body2" sx={{ color: '#004d40', textAlign: 'left' }}>{message.message}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', mt: 1 }}>
                        <Button variant="outlined" color="primary" onClick={() => handleViewMessage(message)} sx={{ mr: 1 }}>
                          View
                        </Button>
                        <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => handleOpenDeleteDialog(message.id)}>
                          Delete
                        </Button>
                        <Button variant="outlined" color="info" startIcon={<ReplyIcon />} onClick={() => handleReplyMessage(message)}>
                          Reply
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                ))
              ) : (
                <Typography variant="body1" align="center">No messages</Typography>
              )}
            </>
          )}

          {tabValue === 1 && (
            <>
              {sentMessages.length > 0 ? (
                sentMessages.map((message) => (
                  <Paper key={message.id} sx={{ p: 2, mt: 2, border: '1px solid teal', borderRadius: '8px', backgroundColor: '#e0f7fa', display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#00796b' }}>To: {message.recipientEmail}</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', mt: 1 }}>
                        <Typography variant="body2" sx={{ color: '#004d40', fontWeight: 'bold' }}>{new Date(message.timestamp).toLocaleString()}</Typography>
                        <Typography variant="body2" sx={{ color: '#004d40', textAlign: 'left' }}>{message.message}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', mt: 1 }}>
                        <Button variant="outlined" color="primary" onClick={() => handleViewMessage(message)} sx={{ mr: 1 }}>
                          View
                        </Button>
                        <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => handleOpenDeleteDialog(message.id)}>
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                ))
              ) : (
                <Typography variant="body1" align="center">No sent messages</Typography>
              )}
            </>
          )}
        </Paper>

        {/* View Message Dialog */}
        <Dialog open={viewDialogOpen} onClose={handleCloseDialogs}>
          <DialogTitle>Message</DialogTitle>
          <DialogContent>
            {selectedMessage && (
              <>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>From: {selectedMessage.senderEmail}</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>To: {selectedMessage.recipientEmail}</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>Date: {new Date(selectedMessage.timestamp).toLocaleString()}</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>Message:</Typography>
                <Typography variant="body2">{selectedMessage.message}</Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialogs}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Reply Message Dialog */}
        <Dialog open={openReplyDialog} onClose={handleCloseDialogs}>
          <DialogTitle>Reply to Message</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Your Reply"
              fullWidth
              multiline
              rows={4}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialogs}>Cancel</Button>
            <Button onClick={handleSendReply} variant="contained" color="primary" startIcon={<SendIcon />}>
              Send
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this message?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
            <Button onClick={handleDeleteMessage} variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Inbox;
