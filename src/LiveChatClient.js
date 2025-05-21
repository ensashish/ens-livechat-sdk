import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from './socketEvents.js';

export class LiveChatClient {
    constructor({ serverUrl, token, companyId, userId, userType = 'customer', onMessage, onAssigned }) {
        this.serverUrl = serverUrl;
        this.token = token;
        this.companyId = companyId;
        this.userId = userId;
        this.userType = userType;
        this.onMessage = onMessage;
        this.onAssigned = onAssigned;
        this.socket = null;
    }

    connect() {
        this.socket = io(this.serverUrl, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            path: '/agent/socket.io/',
            auth: this.token ? { token: this.token } : undefined
        });

        this.socket.on(SOCKET_EVENTS.CONNECT, () => {
            console.log('✅ Connected');
            this.connectToAgent();
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

        this.socket.on(SOCKET_EVENTS.ERROR, (e) => console.warn("❗ Socket Error:", e));
        this.socket.on(SOCKET_EVENTS.DISCONNECT, (r) => console.warn("❌ Disconnected:", r));
        this.socket.on(SOCKET_EVENTS.CONNECT_ERROR, (e) => console.error("🚫 Connection Error:", e));
    }

    connectToAgent() {
        if (!this.socket) {
            console.warn("Socket not initialized");
            return;
        }

        if (!this.companyId || !this.userId) {
            throw new Error("companyId and userId are required");
        }

        this.socket.emit(SOCKET_EVENTS.SETUP, {
            companyId: this.companyId,
            userId: this.userId,
            userType: this.userType
        });
    }

    sendMessage(conversationId, text) {
        if (!conversationId || !text) return;
        this.joinRoom(conversationId);
        this.socket.emit(SOCKET_EVENTS.MESSAGE_SEND, {
            conversationId,
            senderId: this.userId,
            senderType: this.userType,
            text
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