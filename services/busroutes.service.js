const BusRoutesModel = require("../schema/busroutes.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const serviceResponse = require("@baapcompany/core-api/services/serviceResponse");
class BusRoutesService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
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

            const count = await BusRoutesModel.countDocuments(searchFilter);
            const totalPages = Math.ceil(count / limit);
            const skip = (page - 1) * limit;
            const services = await BusRoutesModel.find(searchFilter)
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

    async getByrouteId(routeId) {
        return this.execute(() => {
            return this.model.findOne({ routeId: routeId });
        });
    }

    async getRouteByuserId(userId) {
        try {
            const routeData = await this.model.find({ userId: userId });
    
            if (!routeData) {
                return null;
            }
            return new serviceResponse({
                data: routeData,
            });
        } catch (error) {
            console.error("Error in getRouteByuserId service:", error);
            throw error;
        }
    }
    

    async deleteRoute(routeId, groupId) {
        try {
            return await BusRoutesModel.deleteOne(routeId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updateRoute(routeId, groupId, newData) {
        try {
            const updateRoute = await BusRoutesModel.findOneAndUpdate(
                { routeId: routeId, groupId: groupId },
                newData,
                { new: true }
            );
            return updateRoute;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new BusRoutesService(BusRoutesModel, "busroutes");
