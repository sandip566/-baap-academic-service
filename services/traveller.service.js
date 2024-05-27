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
    async getAllDataByGroupId(groupId, phoneNumber, name, search, page, limit) {
        try {
            const searchFilter = {
                groupId: groupId,
            };
            if (search) {
                const numericSearch = parseInt(search);
                if (!isNaN(numericSearch)) {
                    searchFilter.$or = [
                        { name: { $regex: search, $options: "i" } },
                        { phoneNumber: numericSearch },
                    ];
                } else {
                    searchFilter.$or = [
                        { name: { $regex: search, $options: "i" } },
                    ];
                }
            }
            if (name) {
                searchFilter.name = { $regex: name, $options: "i" };
            }
            if (phoneNumber) {
                searchFilter.phoneNumber = { $regex: phoneNumber, $options: "i" };
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
