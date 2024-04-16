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
        if (criteria.noticeBoardId)
            query.noticeBoardId = criteria.noticeBoardId;
        if (criteria.title) query.title = new RegExp(criteria.title, "i");
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteNoticeBoardByNo(noticeBoardId, groupId) {
        try {
            return await noticeBoardModel.deleteOne(noticeBoardId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updateNoticeBoardByNo(noticeBoardId, groupId, newData) {
        try {
            const updateNoticeBoard = await noticeBoardModel.findOneAndUpdate(
                { noticeBoardId: noticeBoardId, groupId: groupId },
                newData,
                { new: true }
            );
            return updateNoticeBoard;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new noticeBoardService(noticeBoardModel, "noticeBoard");
