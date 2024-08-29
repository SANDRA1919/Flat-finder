import React, { useEffect } from 'react';
import { List, ListItem, ListItemText } from '@mui/material';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const MessageList = ({ messages, currentUserId, recipientId }) => {
  
  // Funcție pentru a marca mesajele ca citite
  const markMessagesAsRead = async () => {
    const unreadMessages = messages.filter(msg => msg.recipientId === currentUserId && !msg.isRead);
    for (const message of unreadMessages) {
      await updateDoc(doc(db, 'messages', message.id), { isRead: true });
    }
  };

  // Marchează mesajele ca citite când componenta se montează
  useEffect(() => {
    markMessagesAsRead();
  }, [messages, currentUserId]);

  return (
    <List>
      {messages.map((msg) => (
        <ListItem key={msg.id}>
          <ListItemText
            primary={msg.message}
            secondary={
              msg.senderId === recipientId 
                ? `Sent at ${new Date(msg.timestamp).toLocaleString()}` 
                : `Received at ${new Date(msg.timestamp).toLocaleString()}`
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default MessageList;
