// src/components/MessageList.jsx
import React from 'react';
import { List, ListItem, ListItemText } from '@mui/material';

const MessageList = ({ messages, currentUserId, recipientId }) => {
  return (
    <List>
      {messages.map((msg) => (
        <ListItem key={msg.id}>
          <ListItemText
            primary={msg.message}
            secondary={msg.senderId === recipientId ? `Sent at ${new Date(msg.timestamp).toLocaleString()}` : null}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default MessageList;
