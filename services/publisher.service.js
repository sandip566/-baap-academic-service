const { query } = require("express");
const BaseService = require("@baapcompany/core-api/services/base.service");
const publisherModel = require("../schema/publisher.schema");

class publisherService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getAllDataByGroupId(groupId, criteria, page, limit) {
        try {
            const searchFilter = { groupId: groupId };

            if (criteria.search) {
                const numericSearch = parseInt(criteria.search);
                if (!isNaN(numericSearch)) {
                    searchFilter.$or = [
                        { publisherId: numericSearch },
                        { phoneNumber: numericSearch },
                    ];
                } else {
                    searchFilter.$or = [
                        {
                            publisherName: {
                                $regex: new RegExp(criteria.search, "i"),
                            },
                        },
                        {
                            address: {
                                $regex: new RegExp(criteria.search, "i"),
                            },
                        },
                        {
                            website: {
                                $regex: new RegExp(criteria.search, "i"),
                            },
                        },
                        { email: { $regex: new RegExp(criteria.search, "i") } },
                    ];
                }
            }

            if (criteria.phoneNumber) {
                searchFilter.phoneNumber = criteria.phoneNumber;
            }

            if (criteria.publisherName) {
                searchFilter.publisherName = {
                    $regex: new RegExp(criteria.publisherName, "i"),
                };
            }

            const sortOrder = { createdAt: -1 };

            const skip = (page - 1) * limit;

            const data = await publisherModel
                .find(searchFilter)
                .sort(sortOrder)
                .skip(skip)
                .limit(limit);

            return { data };
        } catch (error) {
            console.error("Error in getAllDataByGroupId:", error);
            throw new Error("An error occurred while processing the request.");
        }
    }

    async deletePublisherById(publisherId, groupId) {
        try {
            return await publisherModel.deleteOne(publisherId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updatePublisherById(publisherId, groupId, newData) {
        try {
            const updatePublisher = await publisherModel.findOneAndUpdate(
                { publisherId: publisherId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatePublisher;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new publisherService(publisherModel, "publisher");
