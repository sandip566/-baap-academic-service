const ActiveTripsModel = require("../schema/activetrips.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class ActiveTripsService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getBytripId(tripId) {
        return this.execute(() => {
            return this.model.findOne({ tripId: tripId });
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
                        { tripname: { $regex: query.search, $options: "i" } },
                        { phoneNumber: { regex: query.search, $options: "i" } },
                        { tripId: numericSearch },
                    ];
                } else {
                    searchFilter.$or = [
                        { tripname: { $regex: query.search, $options: "i" } },
                        { phoneNumber: { $regex: query.search, $options: "i" } },
                    ];
                }
            }

            if (query.tripId) {
                searchFilter.tripId = query.tripId;
            }

            if (query.tripName) {
                searchFilter.tripName = { $regex: query.name, $options: "i" };
            }

            if (query.phoneNumber) {
                searchFilter.phoneNumber = { $regex: query.phoneNumber, $options: "i" };
            }

            const count = await ActiveTripsModel.countDocuments(searchFilter);
            const totalPages = Math.ceil(count / limit);
            const skip = (page - 1) * limit;
            const services = await ActiveTripsModel.find(searchFilter)
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

    async deleteTripHistroyById(tripId, groupId) {
        try {
            return await ActiveTripsModel.deleteOne(
                tripId,
                groupId
            );
        } catch (error) {
            throw error;
        }
    }

    async updatedriverById(tripId, groupId, newData) {
        try {
            const updatedVisitor = await ActiveTripsModel.findOneAndUpdate(
                { tripId: tripId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedVisitor;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new ActiveTripsService(ActiveTripsModel, 'activetrips');
