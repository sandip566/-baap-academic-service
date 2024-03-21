const attendanceModel = require("../schema/attendance.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class AttendanceService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.reasonOfLateArrival)
            query.reasonOfLateArrival = new RegExp(
                criteria.reasonOfLateArrival,
                "i"
            );
        if (criteria.name) query.name = new RegExp(criteria.name, "i");
        if (criteria.attendanceId) query.attendanceId = criteria.attendanceId;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteAttendanceById(attendanceId, groupId) {
        try {
            return await attendanceModel.deleteOne(attendanceId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updateAttendanceById(attendanceId, groupId, newData) {
        try {
            const updateAttendance = await attendanceModel.findOneAndUpdate(
                { attendanceId: attendanceId, groupId: groupId },
                newData,
                { new: true }
            );
            return updateAttendance;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new AttendanceService(attendanceModel, "attendance");
