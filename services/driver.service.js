const driverModel = require("../schema/driver.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class driverervice extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
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
                        { driverName: { $regex: query.search, $options: "i" } },
                        { phoneNumber: { regex: query.search, $options: "i" } },
                        { driverId: numericSearch },
                    ];
                } else {
                    searchFilter.$or = [
                        { driverName: { $regex: query.search, $options: "i" } },
                        { phoneNumber: { $regex: query.search, $options: "i" } },
                    ];
                }
            }

            if (query.driverId) {
                searchFilter.driverId = query.driverId;
            }

            if (query.driverName) {
                searchFilter.driverName = { $regex: query.name, $options: "i" };
            }

            if (query.phoneNumber) {
                searchFilter.phoneNumber = { $regex: query.phoneNumber, $options: "i" };
            }

            const count = await driverModel.countDocuments(searchFilter);
            const totalPages = Math.ceil(count / limit);
            const skip = (page - 1) * limit;
            const services = await driverModel.find(searchFilter)
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

    async getBydriverId(driverId) {
        return this.execute(() => {
            return this.model.findOne({ driverId: driverId });
        });
    }

    async deleteTripHistroyById(driverId, groupId) {
        try {
            return await driverModel.deleteOne(
                driverId,
                groupId
            );
        } catch (error) {
            throw error;
        }
    }

    async updatedriverById(driverId, groupId, newData) {
        try {
            const updatedVisitor = await driverModel.findOneAndUpdate(
                { driverId: driverId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedVisitor;
        } catch (error) {
            throw error;
        }
    }


}
module.exports = new driverervice(driverModel, "driver");
