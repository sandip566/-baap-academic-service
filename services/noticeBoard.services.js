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
        if (criteria.noticeBoardNo) query.noticeBoardNo = criteria.noticeBoardNo;
        if (criteria.studentId) query.studentId = criteria.studentId;
        if (criteria.memberId) query.memberId = criteria.memberId;
        if (criteria.title) query.title = new RegExp(criteria.title, "i");
        return this.preparePaginationAndReturnData(query, criteria)
    }

    async deleteNoticeBoardByNo(noticeBoardNo, groupId) {
        try {
            return await noticeBoardModel.deleteOne(noticeBoardNo, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updateNoticeBoardByNo(noticeBoardNo, groupId, newData) {
        try {
            const updateNoticeBoard = await noticeBoardModel.findOneAndUpdate(
                { noticeBoardNo: noticeBoardNo, groupId: groupId },
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
