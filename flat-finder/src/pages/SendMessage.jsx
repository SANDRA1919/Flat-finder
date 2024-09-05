import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography } from '@mui/material';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import MessageForm from '../components/MessageForm';
import MessageList from '../components/MessageList';

const SendMessage = () => {
  const { flatId } = useParams();
  const { user } = useAuth();
  const [recipientId, setRecipientId] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchFlatOwner = async () => {
      const flatDoc = await getDoc(doc(db, 'flats', flatId));
      if (flatDoc.exists()) {
        setRecipientId(flatDoc.data().ownerId);
      } else {
        console.error('Flat not found');
      }
    };

    fetchFlatOwner();
  }, [flatId]);

  useEffect(() => {
    if (flatId) {
      const q = query(collection(db, 'messages'), where('flatId', '==', flatId));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messagesArray = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMessages(messagesArray);
      });

      return () => unsubscribe();
    }
  }, [flatId]);

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>Send Message</Typography>
        {recipientId && user && (
          <>
            <MessageForm
              flatId={flatId}
              recipientId={recipientId}
              senderId={user.uid}
              senderEmail={user.email}
            />
            <MessageList
              messages={messages}
              currentUserId={user.uid}
              recipientId={recipientId}
            />
          </>
        )}
      </Paper>
    </Container>
  );
};

export default SendMessage;
