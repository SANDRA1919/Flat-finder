import React, { useEffect } from 'react';
import { List, ListItem, ListItemText } from '@mui/material';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const MessageList = ({ messages, currentUserId, recipientId }) => {
  
  // Function to mark messages as read
  const markMessagesAsRead = async () => {
    const unreadMessages = messages.filter(msg => msg.recipientId === currentUserId && !msg.isRead);
    for (const message of unreadMessages) {
      await updateDoc(doc(db, 'messages', message.id), { isRead: true });
    }
  };

  //  Mark the messages as read when the component is mounte
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
