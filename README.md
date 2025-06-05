# @ens-livechat-client

Lightweight WebSocket client for integrating live chat into your web apps.

## Install

```bash
npm install @ens-livechat-client
```

## Usage

```js
import { LiveChatClient } from "@ens/livechat-client";

const chat = new LiveChatClient({
  serverUrl: "https://yourdomain.com",
  token: "secure-token",
  companyId: "abc123",
  userType: "customer",
  onMessage: (data) => console.log("Message data:", data),
  onAssigned: (conversationId, userId) =>
    console.log("Assigned to convo:", conversationId),
  onCloseConversation: (data) => console.log("Conversation closed:", data),
  onFeedbackRequest: ({ conversationId, sender, userId, text }) => {
    console.log("Feedback requested:", text);
    // Example: Prompt user for feedback
    chat.sendFeedback(conversationId, {
      rating_type: "star",
      rating: 5,
      comment: "Great service!",
    });
  },
});

chat.connect();

chat.connectToAgent("userId", {
  chatTopic: "Support",
  chatSummary: "Initial query",
});

chat.sendMessage("userId", "conversationId", "Hello there!");

chat.sendFeedback("conversationId", {
  rating_type: "thumbs",
  rating: "thumbs_up",
  comment: "Very helpful!",
});

chat.disconnect();
```

## Events

- `onMessage(data)` — Triggered when a new message is received. Data includes
- `onAssigned(conversationId, userId)` — Triggered when a conversation is assigned to a user.
- `onCloseConversation(data)` — Triggered when a conversation is closed.
- `onFeedbackRequest({ conversationId, sender, userId, text })` — Triggered when the server requests      feedback, providing details like the conversation ID, sender, user ID, and request message (e.g., "Please provide your feedback for the recent conversation.").


