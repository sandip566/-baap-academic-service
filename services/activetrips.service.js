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

    async getAllDataByGroupId(groupId, criteria) {
        try {
            const query = {
                groupId: Number(groupId),
            };

            if (criteria.tripId)
                query.tripId = criteria.tripId;

            if (criteria.userId)
                query.userId = criteria.userId;

            if (criteria.routeId)
                query.routeId = criteria.routeId;

            if (criteria.vehicleId)
                query.vehicleId = criteria.vehicleId;

            if (criteria.careTakerId)
                query.careTakerId = criteria.careTakerId;

            if (criteria.driverId)
                query.driverId = criteria.driverId;

            const pageSize = Number(criteria.limit) || 10;
            const currentPage = Number(criteria.page) || 1;
            const skip = (currentPage - 1) * pageSize;

            const pipeLine = await ActiveTripsModel.aggregate([
                { $match: query },
                {
                    "$lookup": {
                        "from": "busroutes",
                        "localField": "routeId",
                        "foreignField": "routeId",
                        "as": "routeId"
                    }
                },
                { $unwind: "$routeId" },
                {
                    "$lookup": {
                        "from": "vehicles",
                        "localField": "vehicleId",
                        "foreignField": "vehicleId",
                        "as": "vehicleId"
                    }
                },
                { $unwind: "$vehicleId" },
                {
                    "$lookup": {
                        "from": "drivers",
                        "localField": "driverId",
                        "foreignField": "driverId",
                        "as": "driverId"
                    }
                },
                { $unwind: "$driverId" },
                {
                    $lookup: {
                        from: "caretakers",
                        localField: "careTakerId",
                        foreignField: "careTakerId",
                        as: "careTakerId",
                    },
                },
                { $unwind: "$careTakerId" },
                { $skip: skip },
                { $limit: pageSize },
            ]);

            const totalDocuments = await ActiveTripsModel.countDocuments(query);
            const totalPages = Math.ceil(totalDocuments / pageSize);
            const response = {
                status: "Success",
                data: pipeLine,
                totalItemsCount: totalDocuments,
                totalPages: totalPages,
                pageSize: pageSize,
                currentPage: currentPage,
            };

            return response;
        } catch (error) {
            console.error("Error in getAllDataByGroupId:", error);
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
