const BusRoutesModel = require("../schema/busroutes.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class BusRoutesService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.routeId) query.routeId = criteria.routeId;
        if (criteria.rootNumber) query.rootNumber = criteria.rootNumber;
        if (criteria.routeName) query.routeName = new RegExp(criteria.routeName, "i");
        if (criteria.search) {
            const searchRegex = new RegExp(criteria.search, "i");
            query.$or = [
                { routeName: searchRegex },
            ];
            const numericSearch = parseInt(criteria.search);
            if (!isNaN(numericSearch)) {
                query.$or.push({ rootNumber: numericSearch });
            }
        }
        return this.preparePaginationAndReturnData(query, criteria);
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
