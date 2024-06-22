const driverModel = require("../schema/driver.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class driverervice extends BaseService {
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

    async getActiveTripByUserId(groupId, userId) {
        const query = {
            groupId: Number(groupId),
            userId: Number(userId)
        };

        const aggregateQuery = [
            { $match: query },
            {
                $lookup: {
                    from: 'activetrips',
                    let: { driverId: "$driverId", groupId: "$groupId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$groupId", "$$groupId"] },
                                        { $eq: ["$driverId", "$$driverId"] },
                                        { $eq: ["$status", "active"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'activeTrip'
                }
            },
            { $unwind: { path: "$activeTrip", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    isActive: { $cond: { if: { $gt: [{ $type: "$activeTrip" }, "missing"] }, then: true, else: false } }
                }
            },
            {
                $project: {
                    _id: 0,
                    groupId: 1,
                    userId: 1,
                    driverId: 1,
                    isActive: 1,
                    status: "$activeTrip.status",
                    startTime: "$activeTrip.startTime",
                    tripId: "$activeTrip.tripId",
                    onBoaredTraveller: "$activeTrip.onBoaredTraveller"
                }
            }
        ];

        const result = await driverModel.aggregate(aggregateQuery);

        if (result.length === 0 || !result[0].isActive) {
            return {
                message: "No active trip found for this route",
                data: []
            };
        }

        const response = result[0];
        delete response.isActive;

        return response;
    }

}
module.exports = new driverervice(driverModel, "driver");
