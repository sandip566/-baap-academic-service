const TravellerModel = require("../schema/traveller.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class TravellerService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getBytravellerId(travellerId) {
        return this.execute(() => {
            return this.model.findOne({ travellerId: travellerId });
        });
    }

    async getAllDataByGroupId(groupId, query, page, limit) {
        try {
            const searchFilter = {
                groupId: groupId,
            };

            if (query.search) {
                const numericSearch = parseInt(query.search);
                if (!isNaN(numericSearch)) {
                    searchFilter.$or = [
                        { travellerName: { $regex: query.search, $options: "i" } },
                        { phoneNumber: { regex: query.search, $options: "i" } },
                        { travellerId: numericSearch },
                    ];
                } else {
                    searchFilter.$or = [
                        { travellerName: { $regex: query.search, $options: "i" } },
                        { phoneNumber: { $regex: query.search, $options: "i" } },
                    ];
                }
            }

            if (query.travellerId) {
                searchFilter.travellerId = query.travellerId;
            }

            if (query.travellerName) {
                searchFilter.travellerName = { $regex: query.name, $options: "i" };
            }

            if (query.phoneNumber) {
                searchFilter.phoneNumber = { $regex: query.phoneNumber, $options: "i" };
            }

            const count = await TravellerModel.countDocuments(searchFilter);
            const totalPages = Math.ceil(count / limit);
            const skip = (page - 1) * limit;
            const services = await TravellerModel.find(searchFilter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const response = {
                status: "Success",
                data: {
                    items: services,
                    totalItemsCount: count,
                    page,
                    limit,
                    totalPages
                },
            };

            return response;
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    }

    async deleteTravellerId(travellerId, groupId) {
        try {
            return await TravellerModel.deleteOne(
                travellerId,
                groupId
            );
        } catch (error) {
            throw error;
        }
    }

    async updatetravellerById(travellerId, groupId, newData) {
        try {
            const updatedVisitor = await TravellerModel.findOneAndUpdate(
                { travellerId: travellerId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedVisitor;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new TravellerService(TravellerModel, 'traveller');
