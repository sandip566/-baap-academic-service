const AssetRequestModel = require("../schema/assetrequest.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
const bookModel = require("../schema/books.schema");
const bookIssueLogModel = require("../schema/bookIssueLog.schema");
const AssetModel = require("../schema/asset.schema");

class AssetRequestService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    // async getAllDataByGroupId(groupId, criteria) {
    //     const query = {
    //         groupId: groupId,
    //     };
    //     if (criteria.name) query.name = new RegExp(criteria.name, "i");
    //     if (criteria.status) query.status = new RegExp(criteria.status, "i");
    //     if (criteria.type) query.type = new RegExp(criteria.type, "i");
    //     if (criteria.category) query.category = new RegExp(criteria.category, "i");
    //     if (criteria.empId) query.empId = criteria.empId;
    //     if (criteria.userId) query.userId = criteria.userId;
    //     return this.preparePaginationAndReturnData(query, criteria);
    // }

    async getAllDataByGroupId(groupId, criteria) {
        const pageNumber = criteria.pageNumber;
        const pageSize = criteria.pageSize;
    
        const query = {
            groupId: Number(groupId),
        };
        if (criteria.search) {
            const numericSearch = parseInt(criteria.search);
            if (!isNaN(numericSearch)) {
                query.$or = [
                    { userName: { $regex: criteria.search, $options: "i" } },
                    { status: { $regex: criteria.search, $options: "i" } },
                    { empId: numericSearch },
                    { userId: numericSearch },
                ];
            } else {
                query.$or = [
                    { userName: { $regex: criteria.search, $options: "i" } },
                    { status: { $regex: criteria.search, $options: "i" } },
                ];
            }
        }
        if (criteria.name) query.name = new RegExp(criteria.name, "i");
        if (criteria.userName)
            query.userName = new RegExp(criteria.userName, "i");
        if (criteria.status) query.status = new RegExp(criteria.status, "i");
        if (criteria.type) query.type = new RegExp(criteria.type, "i");
        if (criteria.category)
            query.category = new RegExp(criteria.category, "i");
        if (criteria.empId) query.empId = criteria.empId;
        if (criteria.managerUserId)
            query.managerUserId = criteria.managerUserId;
        if (criteria.userId) query.userId = criteria.userId;
    
        const totalItemsCount = await AssetRequestModel.countDocuments(query);
        const assetRequest = await AssetRequestModel.aggregate([
            { $match: query },
            { $sort: { createdAt: -1 } },
            { $skip: (pageNumber - 1) * pageSize },
            { $limit: pageSize }
        ]);
    
        return {
            status: "Success",
            data: {
                items: assetRequest,
                totalItemsCount,
            },
        };
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
            const assetRequest = await AssetRequestModel.findOne({ requestId: requestId, groupId: groupId });
            if (!assetRequest) {
                return { error: "Asset request not found" };
            }

            if (assetRequest.status === "Issued" && newData.status === "Issued") {
                return { error: "This request has already been issued" };
            }

            if (newData.status === "Issued") {
                const updateResponse = await this.updateAssetCount(assetRequest.assetId, assetRequest.quantity);
                if (updateResponse !== "Asset count updated successfully") {
                    return { error: updateResponse };
                }
            }

            assetRequest.status = newData.status;
            await assetRequest.save();
            return assetRequest;
        } catch (error) {
            console.error("Error in updateDataById:", error);
            throw error;
        }
    }

    async updateAssetCount(assetId, quantity) {
        try {
            const asset = await AssetModel.findOne({ assetId: assetId });
            if (!asset) {
                return "Asset not found";
            }

            const currentAvailable = Number(asset.available);
            if (isNaN(currentAvailable)) {
                return "Invalid available quantity in asset";
            }

            if (currentAvailable < quantity) {
                return "Asset not available";
            }

            const newAvailable = currentAvailable - quantity;
            asset.available = newAvailable;
            await asset.save();
            return "Asset count updated successfully";
        } catch (error) {
            console.error("Error in updateAssetCount:", error);
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
    async getClearanceData(groupId, userId) {
        try {
            let assetData = await AssetRequestModel.find({
                groupId: groupId,
                userId: userId,
                status: "Issued",
            });
            console.log(assetData);

            let bookData = await bookIssueLogModel.find({
                groupId: groupId,
                userId: userId,
                isReturn: false,
            });
            console.log(bookData);
            let bookIds = bookData.map((log) => log.bookId);

            let bookDetailsMap = await bookModel
                .find({ bookId: { $in: bookIds } })
                .then((books) => {
                    let map = {};
                    books.forEach((book) => {
                        map[book.bookId] = book;
                    });
                    return map;
                });

            let enrichedBookData = bookData.map((log) => {
                return {
                    ...log.toObject(),
                    bookId: bookDetailsMap[log.bookId],
                };
            });

            let response = {
                bookData: enrichedBookData,
                assetData: assetData,
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
    async getAssetsDetailsByRequestId(requestId) {
        return this.execute(() => {
            return AssetRequestModel.find({
                requestId: requestId,
            });
        });
    }


    async bulkUploadAssetRequest(data) {
        try {
            const { name, userName, groupId, describe,
                quantity, priority, location, available,
                userId, managerId, type, status
            } = data;

            console.log("Query", {
                groupId: groupId,
                name: name,
                userName: userName,
                describe: describe,
                quantity: quantity,
                priority: priority,
                location: location,
                available: available,
                userId: userId,
                managerId: managerId,
                type: type,
                status: status

            });
            const document = new AssetRequestModel(data);
            const assetRequest = await document.save();
            return assetRequest;
        } catch (error) {
            console.error("Error uploading to MongoDB:", error.message);
            throw error;
        }
    }
}
module.exports = new AssetRequestService(AssetRequestModel, "assetrequest");
