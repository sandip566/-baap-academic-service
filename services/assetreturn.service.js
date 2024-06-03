const AssetReturnModel = require("../schema/assetreturn.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class AssetReturnService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getByAssetTypeId(returnAssetId) {
        return this.execute(() => {
            return AssetReturnModel.findOne({
                returnAssetId: returnAssetId,
            });
        });
    }
    async getAllDataByGroupId(
        groupId,
        query,
        page,
        limit,
        reverseOrder = true
    ) {
        try {
            const searchFilter = {
                groupId: Number(groupId),
            };

            if (query.search) {
                const numericSearch = parseInt(query.search);
                if (!isNaN(numericSearch)) {
                    searchFilter.$or = [
                        { userName: { $regex: query.search, $options: "i" } },
                        { name: { $regex: query.search, $options: "i" } },
                        { requestId: numericSearch },
                        { returnAssetId: numericSearch },
                    ];
                } else {
                    searchFilter.$or = [
                        { userName: { $regex: query.search, $options: "i" } },
                        { name: { $regex: query.search, $options: "i" } },
                    ];
                }
            }

            if (query.requestId) {
                searchFilter.requestId = query.requestId;
            }

            if (query.status) {
                searchFilter.status = {
                    $regex: query.status,
                    $options: "i",
                };
            }

            const currentPage = page;
            const perPage = limit;
            const skip = (currentPage - 1) * perPage;

            const pipeline = [
                { $match: searchFilter },
                { $unwind: "$requestId" },
                {
                    $lookup: {
                        from: "assetrequests",
                        localField: "requestId",
                        foreignField: "requestId",
                        as: "assetRequestData",
                    },
                },
                {
                    $addFields: {
                        requestId: { $arrayElemAt: ["$assetRequestData", 0] },
                    },
                },
                {
                    $unset: "assetRequestData",
                },
                { $skip: skip },
                { $limit: perPage },
                { $sort: { _id: -1 } },
            ];

            const servicesWithData = await AssetReturnModel.aggregate(
                pipeline
            ).exec();
            servicesWithData.sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return reverseOrder ? dateB - dateA : dateA - dateB;
            });

            const totalItemsCount = await AssetReturnModel.aggregate([
                { $match: searchFilter },

                {
                    $count: "totalItemsCount",
                },
            ]).exec();

            const response = {
                status: "Success",
                data: {
                    items: servicesWithData,
                    totalItemsCount: totalItemsCount[0]?.totalItemsCount,
                },
            };
            return response;
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    }
    async updateByAssetId(returnAssetId, groupId, newData) {
        try {
            const updatedData = await AssetReturnModel.findOneAndUpdate(
                { returnAssetId: returnAssetId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async deleteByAssetId(returnAssetId, groupId) {
        try {
            const deleteData = await AssetReturnModel.deleteOne({
                returnAssetId: returnAssetId,
                groupId: groupId,
            });
            return deleteData;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new AssetReturnService(AssetReturnModel, "assetreturn");
