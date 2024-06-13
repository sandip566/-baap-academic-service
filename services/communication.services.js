const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
const Communication = require("../schema/communication.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class CommunicationService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const utcOffset = 330; 
        const istDate = new Date(date.getTime() + (utcOffset * 60 * 1000));
    
        const day = ("0" + istDate.getUTCDate()).slice(-2);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[istDate.getUTCMonth()];
        const year = istDate.getUTCFullYear();
    
        let hours = istDate.getUTCHours();
        const minutes = ("0" + istDate.getUTCMinutes()).slice(-2);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; 
    
        return `${day} ${month},${year} ${hours}:${minutes} ${ampm}`;
    }
    
    
    async saveChat(data) {
        try {
            const { senderId, receiverId } = data;
            const communicationId = await this.findOrCreateCommunicationId(senderId, receiverId);
            const newChat = new this.model({ ...data, communicationId });
            const savedChat = await newChat.save(); 
            const formattedChat = {
                ...savedChat.toObject(),
                formattedDateTime: this.formatDate(savedChat.timestamp)
            };
            return new ServiceResponse({ data: formattedChat });
        } catch (error) {
            console.error('Error while saving chat:', error);
            throw new Error('Error while saving chat');
        }
    }

    async findOrCreateCommunicationId(senderId, receiverId) {
        try {
            const chat = await this.model.findOne({
                $or: [
                    { senderId: senderId, receiverId: receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            }).sort({ timestamp: -1 });

            return chat ? chat.communicationId : +Date.now();
        } catch (error) {
            console.error('Error in findOrCreateCommunicationId:', error);
            throw new Error('Error while finding or creating communication ID');
        }
    }

    async getChatsBySenderIdAndReceiverId(senderId, receiverId) {
        try {
            const lastMessage = await this.model.findOne({
                $or: [
                    { senderId: senderId, receiverId: receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            }).sort({ timestamp: -1 });

            const formattedMessage = lastMessage ? {
                ...lastMessage.toObject(),
                formattedDateTime: this.formatDate(lastMessage.timestamp)
            } : null;

            return new ServiceResponse({ data: formattedMessage });
        } catch (error) {
            console.error('Error while fetching last message:', error);
            throw new Error('Error while fetching last message');
        }
    }

    async getAllChatsBySenderIdAndReceiverId(senderId, receiverId) {
        try {
            const chats = await this.model.find({
                $or: [
                    { senderId: senderId, receiverId: receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            }).sort({ timestamp: 1 });

            const formattedChats = chats.map(chat => ({
                ...chat.toObject(),
                formattedDateTime: this.formatDate(chat.timestamp)
            }));

            return new ServiceResponse({ data: formattedChats });
        } catch (error) {
            console.error('Error while fetching chats by sender and receiver ID:', error);
            throw new Error('Error while fetching chats by sender and receiver ID');
        }
    }

    async getLatestMessageFromEachChat() {
        try {
            const latestMessages = await this.model.aggregate([
                // Sort messages by timestamp in descending order
                { $sort: { timestamp: -1 } },
                // Group by a unique sender-receiver pair
                {
                    $group: {
                        _id: {
                            senderReceiverPair: {
                                $cond: [
                                    { $lt: ["$senderId", "$receiverId"] },
                                    { senderId: "$senderId", receiverId: "$receiverId" },
                                    { senderId: "$receiverId", receiverId: "$senderId" }
                                ]
                            }
                        },
                        latestMessage: { $first: "$$ROOT" }
                    }
                },
                // Unwind the group result to flatten the structure
                { $replaceRoot: { newRoot: "$latestMessage" } }
            ]);
            
            // Map and format the messages
            const formattedMessages = latestMessages.map(chat => ({
                ...chat,
                formattedDateTime: this.formatDate(chat.timestamp)
            }));
    
            // Sort messages by timestamp in descending order for the final output
            formattedMessages.sort((a, b) => b.timestamp - a.timestamp);
    
            return new ServiceResponse({ data: formattedMessages });
        } catch (error) {
            console.error('Error while fetching latest messages from each chat:', error);
            throw new Error('Error while fetching latest messages from each chat');
        }
    }
    
    async deleteChatById(chatId) {
        try {
            const deletedChat = await this.model.findByIdAndDelete(chatId);

            const formattedDeletedChat = deletedChat ? {
                ...deletedChat.toObject(),
                formattedDateTime: this.formatDate(deletedChat.timestamp)
            } : null;

            return new ServiceResponse({ data: formattedDeletedChat });
        } catch (error) {
            console.error('Error while deleting chat:', error);
            throw new Error('Error while deleting chat');
        }
    }
}

module.exports = new CommunicationService(Communication, "communication");
