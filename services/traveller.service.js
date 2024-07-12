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

    async calculateFees(groupId, routeId, startDate, endDate, totalFees) {
        const startDateParsed = new Date(startDate.split('/').reverse().join('-'));
        const endDateParsed = new Date(endDate.split('/').reverse().join('-'));

        const durationInDays = Math.ceil((endDateParsed - startDateParsed) / (1000 * 60 * 60 * 24));

        const route = await BusRouteModel.findOne(
            {
                groupId: Number(groupId),
                routeId: Number(routeId)
            }
        )
        const feesFreq = route.feesFreq
        if (!feesFreq) {
            res.send("FeesFreq is not found")
        }

        const daysInCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        const daysInCurrentYear = (new Date(new Date().getFullYear(), 11, 31) - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24);
        const daysInCurrentQuarter = Math.floor((new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3 + 3, 0) - new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1)) / (1000 * 60 * 60 * 24)) + 1;
        const daysInCurrentHalfYear = Math.floor((new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 6) * 6 + 6, 0) - new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 6) * 6, 1)) / (1000 * 60 * 60 * 24)) + 1;

        let fee;
        switch (feesFreq) {
            case "Monthly":
                fee = totalFees / daysInCurrentMonth;
                break;
            case "Yearly":
                fee = totalFees / daysInCurrentYear;
                break;
            case "Half Yearly":
                fee = totalFees / daysInCurrentHalfYear;
                break;
            case "Quarterly":
                fee = totalFees / daysInCurrentQuarter;
                break;
            default:
                fee = totalFees;
        }

        const totalFee = fee * durationInDays
        return {
            totalFee: Math.round(totalFee)
        }
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

            const totalFeesSumResult = await TravellerModel.find(searchFilter).sort({ createdAt: -1 });

            const totalFeesSum = totalFeesSumResult
                .map(item => item.totalFees)
                .reduce((acc, curr) => acc + (curr || 0), 0);

            const totalRemainingSum = totalFeesSumResult
                .map(item => item.remainingFees)
                .reduce((acc, curr) => acc + (curr || 0), 0);

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
                    totalPages,
                    totalFeesSum: Math.round(totalFeesSum),
                    totalRemainingSum: Math.round(totalRemainingSum)
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
    async calculateTotalFees(groupId, travellerId) {
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
                        routeData: {
                            feesFreq: "$routeData.feesFreq",
                            name: "$routeData.name",
                            start: "$routeData.start",
                            end: "$routeData.end",
                            driverId: "$routeData.driverId",
                            careTakerId: "$routeData.careTakerId",
                            vehicleId: "$routeData.vehicleId",
                            number: "$routeData.number",
                            currentLocation: "$routeData.currentLocation",
                            stopDetails: "$routeData.stopDetails",
                            shift: "$routeData.shift",
                            createdAt: "$routeData.createdAt",
                            updatedAt: "$routeData.updatedAt",
                            __v: "$routeData.__v"
                        },
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

    async calculateRemainingFees(groupId, userId, updateData) {
        try {
            const query = {
                groupId: Number(groupId),
                userId: Number(userId)
            };

            const paidFee = updateData.paidFees;
            const description = updateData.description;
            const date = updateData.date;

            if (isNaN(query.groupId) || isNaN(query.userId) || isNaN(paidFee)) {
                throw new Error("Invalid input data. GroupId, userId, or paidFees are not valid numbers.");
            }

            const traveller = await TravellerModel.findOne(query).sort({ createdAt: -1 });

            if (!traveller) {
                throw new Error("Traveller not found for provided groupId and userId.");
            }

            if (traveller.totalFees === undefined) {
                throw new Error("Total fees not found for the traveller.");
            }

            if (traveller.remainingFees < paidFee) {
                throw new Error("Don't accept extra payment.");
            }

            const totalPaidAmount = traveller.paidFees.reduce((acc, fee) => acc + fee.paidFee, 0) + paidFee;
            const remainingFees = traveller.remainingFees - paidFee

            const update = {
                $set: { remainingFees: remainingFees, paidAmount: totalPaidAmount },
                $push: { paidFees: { paidFee, description, date } },
            };

            await TravellerModel.findOneAndUpdate(query, update);

            return {
                status: "Success",
                remainingFees: Math.round(remainingFees)
            };
        } catch (error) {
            return {
                status: "Error",
                message: error.message
            };
        }
    }

}


module.exports = new TravellerService(TravellerModel, 'traveller');
