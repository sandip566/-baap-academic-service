const AdmissionCancelModel = require("../schema/admissioncancel.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const StudentsAdmissionModel = require("../schema/studentAdmission.schema");
const { default: mongoose } = require("mongoose");
const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");

class AdmissionCancelService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getAllDataByGroupId(groupId, criteria, page, pageSize) {
        const matchStage = {
            groupId:Number(groupId),
        };
       
        if (criteria.name) {
            matchStage["name"] = { $regex: new RegExp(criteria.name, "i") };
        }
        if (criteria.status) {
            matchStage["status"] = { $regex: new RegExp(criteria.status, "i") };
        }
        const totalItemsCount = await AdmissionCancelModel.countDocuments(
            matchStage
        );
        const skip = (page - 1) * pageSize;

        const aggregationPipeline = [
            { $match: matchStage },
            { $skip: skip },
            { $limit: pageSize },
        ];

        try {
            const responseData = await AdmissionCancelModel.aggregate(
                aggregationPipeline
            );

            const response = {
                data: {
                    items: responseData,
                    totalItemsCount: totalItemsCount,
                },
            };

            return response;
        } catch (error) {
            console.error("Error fetching data:", error);
            throw new Error("Failed to fetch data. Please try again later.");
        }
    }
    async updateAdmissionStatus( groupId,addmissionId ) {
        try {
            await AdmissionCancelModel.updateOne(
                { groupId: groupId, addmissionId: addmissionId },
                { $set: { status: "approved" } }
            );

            const updateResult = await StudentsAdmissionModel.updateOne(
                { groupId: groupId ,addmissionId: addmissionId},
                { $set: { admissionStatus: "Cancel" } }
            );

            return updateResult;
        } catch (error) {
            console.error("Error updating admission status:", error);
            throw error;
        }
    }
    async getByCourseIdAndGroupId(groupId, addmissionId) {
        const result = await this.model.findOne({
            groupId: groupId,
            addmissionId: addmissionId,
        });
        return new ServiceResponse({
            data: result,
        });
    }
}

module.exports = new AdmissionCancelService(
    AdmissionCancelModel,
    "admissioncancel"
);
