const vehicleModel = require("../schema/vehicle.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class vehicleervice extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getByvehicleId(vehicleId) {
        return this.execute(() => {
            return this.model.findOne({ vehicleId: vehicleId });
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
                        { vehicleName: { $regex: query.search, $options: "i" } },
                        { phoneNumber: { regex: query.search, $options: "i" } },
                        { vehicleId: numericSearch },
                    ];
                } else {
                    searchFilter.$or = [
                        { vehicleName: { $regex: query.search, $options: "i" } },
                        { phoneNumber: { $regex: query.search, $options: "i" } },
                    ];
                }
            }

            if (query.vehicleId) {
                searchFilter.vehicleId = query.vehicleId;
            }

            if (query.vehicleName) {
                searchFilter.vehicleName = { $regex: query.name, $options: "i" };
            }

            if (query.phoneNumber) {
                searchFilter.phoneNumber = { $regex: query.phoneNumber, $options: "i" };
            }

            const count = await vehicleModel.countDocuments(searchFilter);
            const totalPages = Math.ceil(count / limit);
            const skip = (page - 1) * limit;
            const services = await vehicleModel.find(searchFilter)
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

    async deleteTripHistroyById(vehicleId, groupId) {
        try {
            return await vehicleModel.deleteOne(
                vehicleId,
                groupId
            );
        } catch (error) {
            throw error;
        }
    }

    async updatevehicleById(vehicleId, groupId, newData) {
        try {
            const updatedVisitor = await vehicleModel.findOneAndUpdate(
                { vehicleId: vehicleId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedVisitor;
        } catch (error) {
            throw error;
        }
    }


}
module.exports = new vehicleervice(vehicleModel, "vehicle");
