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
            ];

            if (query.search) {
                const numericSearch = parseInt(query.search);
                const searchConditions = [
                    { "requestId.userName": { $regex: query.search, $options: "i" } },
                    { "requestId.name": { $regex: query.search, $options: "i" } },
                    { "return.name": { $regex: query.search, $options: "i" } },
                ];
                if (!isNaN(numericSearch)) {
                    searchConditions.push(
                        { requestId: numericSearch },
                        { returnAssetId: numericSearch }
                    );
                }

                pipeline.push({
                    $match: {
                        $or: searchConditions
                    }
                });
            }

            pipeline.push(
                { $sort: { createdAt: reverseOrder ? -1 : 1 } },
                { $skip: skip },
                { $limit: perPage }
            );

            const servicesWithData = await AssetReturnModel.aggregate(pipeline).exec();

            const totalItemsCountResult = await AssetReturnModel.aggregate([
                { $match: searchFilter },
                {
                    $count: "totalItemsCount",
                },
            ]).exec();

            const totalItemsCount = totalItemsCountResult[0]?.totalItemsCount || 0;

            const response = {
                status: "Success",
                data: {
                    items: servicesWithData,
                    totalItemsCount: totalItemsCount,
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
