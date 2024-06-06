const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/validateToken.middleware");
const service = require("../services/communication.services");


router.post('/send-customer', async (req, res) => {
    try {
        const { receiver, handledBy, message, userId, groupId } = req.body;
        let communicationId = req.body.communicationId;

        if (!communicationId) {
            communicationId = await service.getCommunicationIdByUserIds(userId, receiver);
            if (!communicationId) {
                communicationId = +Date.now();  
            }
        }
        
        const newChat = await service.saveChat({ userId, receiver, handledBy, message, groupId, communicationId });
        res.json(newChat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/send-L1', async (req, res) => {
    try {
        const { receiver, message, userId, handledBy, sender, groupId } = req.body;
        let communicationId = req.body.communicationId;

        if (!communicationId) {
            communicationId = await service.getCommunicationIdByUserIds(sender, receiver);
            if (!communicationId) {
                communicationId = +Date.now();  
            }
        }

        const newChat = await service.saveChat({ sender, receiver, userId, message, communicationId, groupId, handledBy });
        res.json(newChat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get('/:groupId/:communicationId', async (req, res) => {
    try {
        const communicationId = req.params.communicationId;
        const chats = await service.getChatsByCommunicationId(communicationId);
        res.json(chats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:groupId/:communicationId', async (req, res) => {
    try {
        const communicationId = req.params.communicationId;
        const result = await service.deleteChatsByCommunicationId(communicationId);
        res.json({ message: `Deleted ${result.deletedCount} chats for communicationId: ${communicationId}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/grouped-by-customer', async (req, res) => {
    try {
        const groupedChats = await service.getChatsGroupedByCustomer();
        res.json(groupedChats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
