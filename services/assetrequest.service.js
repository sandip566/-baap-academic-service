const AssetRequestModel = require("../schema/assetrequest.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");

const bookIssueLogModel = require("../schema/bookIssueLog.schema");
class AssetRequestService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.name) query.name = new RegExp(criteria.name, "i");
        if (criteria.status) query.status = new RegExp(criteria.status, "i");
        if (criteria.type) query.type = new RegExp(criteria.type, "i");
        if (criteria.category) query.category = new RegExp(criteria.category, "i");
        if (criteria.empId) query.empId = criteria.empId;
        if (criteria.userId) query.userId = criteria.userId;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteByDataId(requestId, groupId) {
        try {
            const deleteData = await AssetRequestModel.findOneAndDelete({
                requestId: requestId,
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

    async updateDataById(requestId, groupId, newData) {
        try {
            const updatedData = await AssetRequestModel.findOneAndUpdate(
                { requestId: requestId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async getByDataId(requestId) {
        return this.execute(() => {
            return AssetRequestModel.findOne({
                requestId: requestId,
            });
        });
    }

    async updateRequest(requestId, data) {
        try {
            const updateRequest = await AssetRequestModel.findOneAndUpdate(
                { requestId: requestId },
                data,
                { new: true, upsert: true }
            );
            return new ServiceResponse({
                data: updateRequest,
            });
        } catch (error) {
            return new ServiceResponse({
                isError: true,
                message: error.message,
            });
        }
    }
    async  getClearanceData(groupId, userId) {
        try {
            
            let assetData = await AssetRequestModel.find({ groupId: groupId, userId: userId, status: "Issued" });
            console.log(assetData);
            
            let bookData = await bookIssueLogModel.find({ groupId: groupId, userId: userId, isReturn: false });
            console.log(bookData);
    
            let response = {
                bookData: bookData,
                assetData: assetData
            };
            
            return response;
        } catch (error) {
            console.error(error);
            throw error; 
        }
    }
    
    async getAssetsDetailsById(userId) {
        return this.execute(() => {
            return AssetRequestModel.find({
                userId: userId,
            });
        });
    }
}
module.exports = new AssetRequestService(AssetRequestModel, 'assetrequest');
