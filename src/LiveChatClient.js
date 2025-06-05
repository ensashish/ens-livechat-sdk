import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from './socketEvents.js';

export class LiveChatClient {
    constructor({ serverUrl, token, companyId, userType = 'customer', onMessage, onAssigned, onCloseConversation, onFeedbackRequest }) {
        this.serverUrl = serverUrl;
        this.token = token;
        this.companyId = companyId;
        this.userId = null;
        this.userType = userType;
        this.onMessage = onMessage;
        this.onAssigned = onAssigned;
        this.onCloseConversation = onCloseConversation;
        this.onFeedbackRequest = onFeedbackRequest;
        this.socket = null;
    }

    connect() {
        this.socket = io(this.serverUrl, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            path: '/agent/socket.io/',
            auth: this.token && this.companyId ? { token: this.token, companyId: this.companyId } : undefined
        });

        this.socket.on(SOCKET_EVENTS.CONNECT, () => {
            console.log('||--:: ✅ ENS Client Connected ::--||');
        });

        this.socket.on(SOCKET_EVENTS.MESSAGE_RECEIVED, (data) => {
            this.onMessage?.(data);
        });

        this.socket.on(SOCKET_EVENTS.CONVERSATION_ASSIGNED_USER, (data) => {
            const conversationId = data?.conversationId;
            const userId = data?.userId;
            this.onAssigned?.(conversationId, userId);
            if (conversationId) this.joinRoom(conversationId);
        });

        this.socket.on(SOCKET_EVENTS.CLOSED_CONVERSATION_USER, (data) => {
            this.onCloseConversation?.(data);
        });

        this.socket.on(SOCKET_EVENTS.FEEDBACK_REQUEST, (data) => {
            const { conversationId, sender, userId, text } = data;
            this.onFeedbackRequest?.({ conversationId, sender, userId, text });
        });

        this.socket.on(SOCKET_EVENTS.FEEDBACK_RECEIVED, (data) => {
            const { conversationId, sender, text, userId } = data;
            console.log(`Feedback confirmation received: ${text}`);
            this.onMessage?.({ conversationId, sender, text, userId });
        });

        this.socket.on(SOCKET_EVENTS.ERROR, (e) => console.warn("❗ Socket Error:", e));
        this.socket.on(SOCKET_EVENTS.DISCONNECT, (r) => console.warn("❌ Disconnected:", r));
        this.socket.on(SOCKET_EVENTS.CONNECT_ERROR, (e) => console.error("🚫 Connection Error:", e));
    }

    connectToAgent(userId, { chatTopic, chatSummary }) {
        if (!this.socket) {
            console.warn("Socket not initialized");
            return;
        }

        if (!this.companyId || !userId) {
            throw new Error("companyId and userId are required");
        }

        this.userId = userId; // Store userId for feedback
        this.socket.emit(SOCKET_EVENTS.SETUP, {
            companyId: this.companyId,
            userId: userId,
            userType: this.userType,
            chatTopic: chatTopic,
            chatSummary: chatSummary
        });
    }

    sendMessage(userId, conversationId, text, type = 'text') {
        if (!conversationId || !text) return;
        this.joinRoom(conversationId);
        this.socket.emit(SOCKET_EVENTS.MESSAGE_SEND, {
            conversationId,
            senderId: userId,
            senderType: this.userType,
            text,
            type
        });
    }

    sendFeedback(conversationId, feedback) {
        if (!conversationId || !feedback || !feedback.rating_type || !feedback.rating) {
            console.warn("Invalid feedback data");
            return;
        }
        if (!this.socket) {
            console.warn("Socket not initialized");
            return;
        }
        this.socket.emit(SOCKET_EVENTS.FEEDBACK_RESPONSE, {
            conversationId,
            feedback: {
                rating_type: feedback.rating_type, // 'thumbs' or 'star'
                rating: feedback.rating, // e.g., 'thumbs_up', 'thumbs_down', or number for stars
                comment: feedback.comment || '' // Optional comment
            }
        });
    }

    joinRoom(conversationId) {
        if (!conversationId) return;
        this.socket.emit(SOCKET_EVENTS.JOIN_ROOM, conversationId);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}