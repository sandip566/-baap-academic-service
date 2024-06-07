const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/validateToken.middleware");
const service = require("../services/communication.services");

const validateChatData = (req, res, next) => {
    const { receiver, sender, message, groupId, senderId, receiverId } = req.body;
    if (!receiver || !sender || !message || !groupId || !senderId || !receiverId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    next();
};

router.post('/send-customer', validateChatData, async (req, res) => {
    try {
        const newChat = await service.saveChat(req.body);
        res.json(newChat);
    } catch (error) {
        console.error('Error in /send-customer:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/by-sender-receiver/:senderId/:receiverId', async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;
        const lastChat = await service.getChatsBySenderIdAndReceiverId(senderId, receiverId);
        res.json(lastChat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/all-chats/:senderId/:receiverId', async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;
        const allChats = await service.getAllChatsBySenderIdAndReceiverId(senderId, receiverId);
        res.json(allChats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/delete-chat/:chatId', async (req, res) => {
    try {
        const { chatId } = req.params;
        const deletedChat = await service.deleteChatById(chatId);
        res.json(deletedChat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
