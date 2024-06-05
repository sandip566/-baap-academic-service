const TravellerModel = require("../schema/traveller.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const BusRouteModel = require("../schema/busroutes.schema");
const serviceResponse = require("@baapcompany/core-api/services/serviceResponse");
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

    async getTravellersByRouteID(routeId) {
        try {
            const routeData = await this.model.find({ routeId: routeId });
    
            if (!routeData) {
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
}

module.exports = new TravellerService(TravellerModel, 'traveller');
