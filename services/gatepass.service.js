const GatepassModel = require("../schema/gatepass.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const StudentAdmissionModel = require("../schema/studentAdmission.schema")

class GatepassService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.search) {
            const numericSearch = parseInt(criteria.search);
            if (!isNaN(numericSearch)) {
                query.$or = [
                    { userId: numericSearch },
                    { gatepassId: numericSearch },
                    { managerUserId: numericSearch }
                ];
            } else {
                query.$or = [
                    { reason: { $regex: criteria.search, $options: "i" } },
                    { status: { $regex: criteria.search, $options: "i" } },
                ];
            }
        }
        if (criteria.status) query.status = criteria.status;
        if (criteria.reason) query.reason = new RegExp(criteria.reason, "i");
        if (criteria.userId) query.userId = criteria.userId;
        if (criteria.gatepassId) query.gatepassId = criteria.gatepassId;
        if (criteria.managerUserId) query.managerUserId = criteria.managerUserId;

        const pageNumber = criteria.pageNumber;
        const pageSize = criteria.pageSize;
        const skip = (pageNumber - 1) * pageSize;
        const limit = pageSize;

        const gatepassData = await GatepassModel.find(query)
            .skip(skip)
            .limit(limit)
            .exec();

        await Promise.all(gatepassData.map(async (gatepass) => {
            const studentAdmission = await StudentAdmissionModel.findOne({ userId: gatepass.userId }).exec();
            if (studentAdmission && studentAdmission.familyDetails && studentAdmission.familyDetails.length > 0) {
                const familyDetail = studentAdmission.familyDetails.find(detail => detail.father_name);
                gatepass.fatherName = familyDetail ? familyDetail.father_name : null;
            } else {
                gatepass.fatherName = null;
            }
        }));
        const result = gatepassData.map(gp => ({
            ...gp.toObject(),
            fatherName: gp.fatherName
        }));
        return {
            data: result,
            totalCount: await GatepassModel.countDocuments(query).exec()
        };
    }

    async deleteByDataId(gatepassId, groupId) {
        try {
            const deleteData = await GatepassModel.findOneAndDelete({
                gatepassId: gatepassId,
                groupId: groupId,
            });
            return {
                data: deleteData,
                message: "Data deleted successfully",
            };
        } catch (error) {
            throw error;
        }
    }

    async updateDataById(gatepassId, groupId, newData) {
        try {
            const updatedData = await GatepassModel.findOneAndUpdate(
                { gatepassId: gatepassId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async getByDataId(gatepassId) {
        return this.execute(() => {
            return GatepassModel.findOne({
                gatepassId: gatepassId,
            });
        });
    }
}

module.exports = new GatepassService(GatepassModel, 'gatepass');
