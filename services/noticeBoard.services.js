const noticeBoardModel = require("../schema/noticeBoard.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class noticeBoardService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllNoticeByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.noticeBoardId) query.noticeBoardId = criteria.noticeBoardId;
        if (criteria.title) query.title = new RegExp(criteria.title, "i");
        if (criteria.isActive) query.isActive = criteria.isActive;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteNoticeBoardById(noticeBoardId, groupId) {
        try {
            return await noticeBoardModel.deleteOne(noticeBoardId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updateNoticeBoardById(noticeBoardId, groupId, newData) {
        try {
            const updatedNoticeBoard = await noticeBoardModel.findOneAndUpdate(
                { noticeBoardId: noticeBoardId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedNoticeBoard;
        } catch (error) {
            throw error;
        }
    }

    async getByDataId(noticeBoardId) {
        return this.execute(() => {
            return noticeBoardModel.findOne({
                noticeBoardId: noticeBoardId,
            });
        });
    }
}
module.exports = new noticeBoardService(noticeBoardModel, "noticeBoard");
