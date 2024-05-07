const AdmissionCancelModel = require("../schema/admissioncancel.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class AdmissionCancelService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getAllDataByGroupId(gpId, criteria, page, pageSize) {
        const matchStage = {
            gpId: new mongoose.Types.ObjectId(gpId),
        };
        const totalItemsCount = await AdmissionCancelModel.countDocuments(matchStage);
        if (criteria.name) {
            matchStage["name"] = { $regex: new RegExp(criteria.name, "i") };
        }

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
}

module.exports = new AdmissionCancelService(AdmissionCancelModel, 'admissioncancel');
