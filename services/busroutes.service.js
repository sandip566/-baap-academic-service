const BusRoutesModel = require("../schema/busroutes.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const serviceResponse = require("@baapcompany/core-api/services/serviceResponse");
class BusRoutesService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async findByRouteNo(groupId, number) {
        try {
            const route = await BusRoutesModel.findOne({ groupId, number });
            return route;
        } catch (error) {
            console.error("Error finding route by number:", error);
            throw new Error("Error finding route by numbre: " + error.message);
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

    async getRouteByuserId(groupId, userId) {
        try {
            const routeData = await this.model.find({ groupId: groupId, userId: userId });

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

    async findRouteByNoExcludeCurrent(groupId, number, routeId) {
        try {
            const route = await BusRoutesModel.findOne({
                groupId: groupId,
                number: number,
                routeId: { $ne: routeId } 
            });
            return route;
        } catch (error) {
            throw error;
        }
    }

    async updateRouteById(groupId, routeId, newData) {
        try {
            const updatedRoute = await BusRoutesModel.findOneAndUpdate(
                { groupId: groupId, routeId: routeId },
                newData,
                { new: true }
            );
            return updatedRoute;
        } catch (error) {
            throw error;
        }
    }

    async getNearestStop(groupId, userId, currentLat, currentLong) {
        let routes = await BusRoutesModel.find({
            groupId: Number(groupId),
            userId: Number(userId)
        });

        if (!routes || routes.length === 0) {
            return { message: "No routes found" };
        }

        const haversineDistance = (lat1, lon1, lat2, lon2) => {
            const toRad = (value) => value * Math.PI / 180;
            const R = 6371;
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        for (let route of routes) {
            let nearestStop = null;
            let minDistance = Infinity;

            const activeStops = route.stopDetails.filter(stop => !stop.isPassed);

            for (let stop of activeStops) {
                const distance = haversineDistance(currentLat, currentLong, stop.location.lattitude, stop.location.longitude);

                if (distance === 0) {
                    stop.isPassed = true;
                    await route.save();
                    continue;
                }

                if (distance < minDistance) {
                    minDistance = distance;
                    nearestStop = stop;
                }
            }

            route.nearestStop = nearestStop ? {
                ...nearestStop,
                distance: minDistance
            } : 'YOUR TRIP IS COMPLETED.';
        }

        return routes.map(route => ({
            groupId: route.groupId,
            userId: route.userId,
            routeId: route.routeId,
            name: route.name,
            start: route.start,
            end: route.end,
            driverId: route.driverId,
            careTakerId: route.careTakerId,
            vehicleId: route.vehicleId,
            number: route.number,
            feesFreq: route.feesFreq,
            nearestStop: route.nearestStop
        }));
    }

}
module.exports = new BusRoutesService(BusRoutesModel, "busroutes");
