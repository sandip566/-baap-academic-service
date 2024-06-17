const TravellerModel = require("../schema/traveller.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const BusRouteModel = require("../schema/busroutes.schema");
const serviceResponse = require("@baapcompany/core-api/services/serviceResponse");
const ActiveTripsModel = require("../schema/activetrips.schema");
const { route } = require("../routes/books.routes");
class TravellerService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getBytravellerId(groupId, travellerId) {
        let traveller = await TravellerModel.findOne({ groupId: groupId, travellerId: travellerId })
        const routeId = traveller.routeId

        if (!routeId) {
            throw new Error("routeId not found.");
        }

        let route = await BusRouteModel.findOne({ groupId: groupId, routeId: routeId })

        let responseData = {
            status: "Success",
            data: {

                ...traveller.toObject(),
                routeId: route.toObject()

            }
        };

        return responseData;
    }

    async getTravellersByRouteId(groupId, routeId) {
        try {
            const routeData = await this.model.find({ groupId: groupId, routeId: routeId });

            if (routeData.length === 0) {
                return null;
            }
            return new serviceResponse({
                data: routeData,
            });
        } catch (error) {
            console.error("Error in getRouteByrouteId service:", error);
            throw error;
        }
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

  
    async  calculateTotalFees(groupId, travellerId) {
        try {
            const result = await TravellerModel.aggregate([
                {
                    $match: {
                        groupId: groupId,
                        travellerId: travellerId
                    }
                },
                {
                    $lookup: {
                        from: "busroutes",
                        let: { groupId: "$groupId", routeId: "$routeId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$groupId", "$$groupId"] },
                                            { $eq: ["$routeId", "$$routeId"] }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    feesFreq: 1
                                }
                            }
                        ],
                        as: "routeData"
                    }
                },
                {
                    $unwind: "$routeData"
                },
                {
                    $addFields: {
                        startDateParsed: { $dateFromString: { dateString: "$startDate", format: "%d/%m/%Y" } },
                        endDateParsed: { $dateFromString: { dateString: "$endDate", format: "%d/%m/%Y" } }
                    }
                },
                {
                    $addFields: {
                        fee: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ["$routeData.feesFreq", "Monthly"] }, then: { $divide: ["$totalFees", 30] } },
                                    { case: { $eq: ["$routeData.feesFreq", "Yearly"] }, then: { $divide: ["$totalFees", 360] } },
                                    { case: { $eq: ["$routeData.feesFreq", "Half Yearly"] }, then: { $divide: ["$totalFees", 180] } },
                                    { case: { $eq: ["$routeData.feesFreq", "Quarterly"] }, then: { $divide: ["$totalFees", 120] } }
                                ],
                                default: "$totalFees"
                            }
                        },
    
                        durationInDays: {
                            $add: [
                                {
                                    $divide: [
                                        { $subtract: ["$endDateParsed", "$startDateParsed"] },
                                        1000 * 60 * 60 * 24
                                    ]
                                },
                                1
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        totalFee: { $multiply: ["$fee", "$durationInDays"] }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        groupId: 1,
                        travellerId: 1,
                        userId: 1,
                        routeId: 1,
                        stopId: 1,
                        emergrncyContact: 1,
                        totalFees: 1,
                        startDate: 1,
                        endDate: 1,
                        name: 1,
                        phoneNumber: 1,
                        addresses: 1,
                        emergencyContact: 1,
                        __v: 1,
                       // routeData: 1,
                        feesFreq: "$routeData.feesFreq",
                        stopFee: "$totalFees",
                        days: "$durationInDays",
                        oneDayFee: "$fee",
                        totalFee: 1
                    }
                }
            ]);
    
            if (result.length === 0) {
                return { error: "Traveller not found" };
            }
    
            
            return {
                traveller: result[0]
            };
        } catch (error) {
            console.error("Error in calculateTotalFees:", error);
            throw error;
        }
    }
    

}


module.exports = new TravellerService(TravellerModel, 'traveller');
