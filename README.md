 /* File: README.md */
  # @ens/livechat-client
  
  Lightweight WebSocket client for integrating live chat into your web apps.
  
  ## Install
  
  ```bash
  npm install @ens/livechat-client
  ```
  
  ## Usage
  
  ```js
  import { LiveChatClient } from 'ens-livechat-client';
  
  const chat = new LiveChatClient({
    serverUrl: 'https://yourdomain.com',
    token: 'secure-token',
    companyId: 'abc123',
    onMessage: (msg) => console.log('New message:', msg),
    onAssigned: (conversationId, userId) => console.log('Assigned to convo:', conversationId),
    onCloseConversation: (data) => console.log('Conversation closed:', data),
  });
  
  chat.connect();

  // connect to agent
  chat.connectToAgent(`userId`);
  
  // Send a message
  chat.sendMessage('userId', 'conversationId', 'Hello there!');
  
  // Disconnect when done
  chat.disconnect();
  
  ```
  
  ## Events
  
  - `onMessage(data)` — triggered when a new message is received
  - `onAssigned(conversationId, userId)` — triggered when a conversation is assigned
  