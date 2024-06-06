const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
const Communication = require("../schema/communication.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class CommunicationService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }


    async saveChat(data) {
        try {
            const { senderId, receiverId } = data;
            const communicationId = await this.findOrCreateCommunicationId(senderId, receiverId);
            const newChat = new this.model({ ...data, communicationId });
            const savedChat = await newChat.save();
            return new ServiceResponse({ data: savedChat });
        } catch (error) {
            console.error('Error while saving chat:', error); 
            throw new Error('Error while saving chat');
        }
    }


    async findOrCreateCommunicationId(senderId, receiverId) {
        try {
            console.log(`Finding or creating communication ID for sender: ${senderId}, receiver: ${receiverId}`);
            const chat = await this.model.findOne({
                $or: [
                    { senderId: senderId, receiverId: receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            }).sort({ timestamp: -1 });

            console.log('Found chat:', chat);

            return chat ? chat.communicationId : +Date.now();
        } catch (error) {
            console.error('Error in findOrCreateCommunicationId:', error); 
            throw new Error('Error while finding or creating communication ID');
        }
    }

    async getChatsBySenderIdAndReceiverId(senderId, receiverId) {
        try {
            const chats = await this.model.find({
                $or: [
                    { senderId: senderId, receiverId: receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            }).sort({ timestamp: 1 });
            return new ServiceResponse({ data: chats });
        } catch (error) {
            throw new Error('Error while fetching chats by sender and receiver ID');
        }
    }
}

module.exports = new CommunicationService(Communication, "communication");
