const busModel = require("../schema/bus.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class busService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        criteria.pageSize = 10;
        if (criteria.routeName)
            query.routeName = new RegExp(criteria.routeName, "i");
        if (criteria.schedule)
            query.schedule = new RegExp(criteria.schedule, "i");
        if (criteria.routeId) query.routeId = criteria.routeId;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteRoute(routeId, groupId) {
        try {
            return await busModel.deleteOne(routeId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updateRoute(routeId, groupId, newData) {
        try {
            const updateRoute = await busModel.findOneAndUpdate(
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
module.exports = new busService(busModel, "bus");
