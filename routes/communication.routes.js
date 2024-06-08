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
        const { receiver, sender, message, groupId, senderId, receiverId } = req.body;
        const newChat = await service.saveChat({ receiver, sender, message, groupId, senderId, receiverId });
        res.json(newChat);
    } catch (error) {
        console.error('Error in /send-customer:', error); 
        res.status(500).json({ error: error.message });
    }
});


router.get('/by-sender-receiver/:senderId/:receiverId', async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;
        const chats = await service.getChatsBySenderIdAndReceiverId(senderId, receiverId);
        res.json(chats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
