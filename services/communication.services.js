const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
const Communication = require("../schema/communication.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class CommunicationService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getAllChats() {
        try {
            const chats = await this.model.find().sort({ timestamp: 1 });
            return new ServiceResponse({ data: chats });
        } catch (error) {
            throw new Error('Error while fetching chats');
        }
    }

    async saveChat(data) {
        try {
            const newChat = new this.model(data);
            const savedChat = await newChat.save();
            return new ServiceResponse({ data: savedChat });
        } catch (error) {
            throw new Error('Error while saving chat');
        }
    }

    async getChatsByCommunicationId(communicationId) {
        try {
            const chats = await this.model.find({ communicationId }).sort({ timestamp: 1 });
            return new ServiceResponse({ data: chats });
        } catch (error) {
            throw new Error('Error while fetching chats by communication ID');
        }
    }

    async deleteChatsByCommunicationId(communicationId) {
        try {
            await this.model.deleteMany({ communicationId });
            return new ServiceResponse({ message: 'Chats deleted successfully' });
        } catch (error) {
            throw new Error('Error while deleting chats by communication ID');
        }
    }
}

module.exports = new CommunicationService(Communication, "communication");
