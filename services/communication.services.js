const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
const Communication = require("../schema/communication.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class CommunicationService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    // Centralize date formatting
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const day = ("0" + date.getDate()).slice(-2);
        const month = ("0" + (date.getMonth() + 1)).slice(-2);
        const year = date.getFullYear();
        const hours = ("0" + date.getHours()).slice(-2);
        const minutes = ("0" + date.getMinutes()).slice(-2);

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    async saveChat(data) {
        try {
            const { senderId, receiverId } = data;
            const communicationId = await this.findOrCreateCommunicationId(senderId, receiverId);
            const newChat = new this.model({ ...data, communicationId });
            const savedChat = await newChat.save();
            // Format date before sending response
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
