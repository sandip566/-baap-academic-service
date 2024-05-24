const BusRoutesModel = require("../schema/busroutes.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class BusRoutesService extends BaseService {
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
                        { routename: { $regex: query.search, $options: "i" } },
                        { phoneNumber: { regex: query.search, $options: "i" } },
                        { routeId: numericSearch },
                    ];
                } else {
                    searchFilter.$or = [
                        { routename: { $regex: query.search, $options: "i" } },
                        { phoneNumber: { $regex: query.search, $options: "i" } },
                    ];
                }
            }

            if (query.routeId) {
                searchFilter.routeId = query.routeId;
            }

            if (query.routeName) {
                searchFilter.routeName = { $regex: query.name, $options: "i" };
            }

            if (query.phoneNumber) {
                searchFilter.phoneNumber = { $regex: query.phoneNumber, $options: "i" };
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
