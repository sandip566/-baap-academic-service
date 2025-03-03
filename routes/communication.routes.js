const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/validateToken.middleware");
const service = require("../services/communication.services");
const communicationSchema = require("../schema/communication.schema");

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

router.get('/latest-from-each-chat/:senderId', async (req, res) => {
    try {
        const { senderId } = req.params;
        const latestChats = await service.getLatestMessageFromEachChat(senderId);
        res.json(latestChats);
    } catch (error) {
        console.error('Error in /latest-from-each-chat:', error);
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

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const communicationId = req.body.communication;

        if (!Array.isArray(communicationId) || communicationId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty communicationId array",
            });
        }

        const numericIds = communicationId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${communicationId}`);
            }
            return num;
        });

        const result = await communicationSchema.deleteMany({
            groupId: groupId,
            communicationId: { $in: numericIds },
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "No records found to delete",
            });
        }

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} records deleted successfully`,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
