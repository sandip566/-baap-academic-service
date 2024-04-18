const ReminderModel = require("../schema/reminder.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class ReminderService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getByDataId(reminderId) {
        return this.execute(() => {
            return ReminderModel.findOne({ reminderId: reminderId });
        });
    }
    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.reminderId) query.reminderId = criteria.reminderId;
        if (criteria.reminderName)
            query.reminderName = new RegExp(criteria.reminderName, "i");
        if (criteria.reminderType)
            query.reminderType = new RegExp(criteria.reminderType, "i");
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async updateDataById(reminderId, groupId, newData) {
        try {
            const updatedData = await ReminderModel.findOneAndUpdate(
                { reminderId: reminderId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async deleteByDataId(reminderId, groupId) {
        try {
            const deleteData = await ReminderModel.deleteOne({
                reminderId: reminderId,
                groupId: groupId,
            });
            return deleteData;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new ReminderService(ReminderModel, "reminder");
