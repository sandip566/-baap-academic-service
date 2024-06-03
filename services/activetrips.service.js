const ActiveTripsModel = require("../schema/activetrips.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const BusRouteModel = require("../schema/busroutes.schema")
const CareTakerModel = require("../schema/caretaker.schema")
const DriverModel = require("../schema/driver.schema")

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

    async getActiveTrip(groupId, tripId, lat, long) {
        let query = { groupId: Number(groupId), tripId: Number(tripId) };
        const trip = await ActiveTripsModel.findOne(query);
        if (!trip) {
            return null;
        }

        const driver = await DriverModel.findOne({ driverId: trip.driverId }).select('name expexperience phoneNumber email profile');
        const caretaker = await CareTakerModel.findOne({ careTakerId: trip.careTakerId }).select('name expexperience phoneNumber email profile');

        const routeId = trip.routeId;
        const route = await BusRouteModel.findOne({ groupId: Number(groupId), routeId: routeId });
        if (!route) {
            return null;
        }

        const currentLocation = { latitude: parseFloat(lat), longitude: parseFloat(long) };
        let nearestStop = null;
        let minDistance = Number.MAX_SAFE_INTEGER;

        function calculateDistance(lat1, lon1, lat2, lon2, unit = 'km') {
            const R = 6371;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;

            if (unit === 'm') {
                return distance * 1000;
            }
            return distance;
        }

        route.stopDetails.forEach(stop => {
            const stopLocation = {
                latitude: stop.location.lattitude,
                longitude: stop.location.longitude
            };

            const distance = calculateDistance(currentLocation.latitude, currentLocation.longitude, stopLocation.latitude, stopLocation.longitude);

            if (distance < minDistance) {
                minDistance = distance;
                nearestStop = stop;
            }
        });

        const distanceToNearestStop = calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            nearestStop.location.lattitude,
            nearestStop.location.longitude,
            'm'
        );

        if (distanceToNearestStop <= 100) {
            minDistance = Number.MAX_SAFE_INTEGER;
            nearestStop = null;

            route.stopDetails.forEach(stop => {
                const stopLocation = {
                    latitude: stop.location.lattitude,
                    longitude: stop.location.longitude
                };

                const distance = calculateDistance(currentLocation.latitude, currentLocation.longitude, stopLocation.latitude, stopLocation.longitude);

                if (distance > 0.1 && distance < minDistance) {
                    minDistance = distance;
                    nearestStop = stop;
                }
            });
        }

        if (nearestStop) {
            const averageSpeed = 30;
            const arrivalTimeInHours = minDistance / averageSpeed;
            const hours = Math.floor(arrivalTimeInHours);
            const minutes = Math.round((arrivalTimeInHours - hours) * 60);
            const formattedDistance = minDistance.toFixed(2) + ' km';
            const formattedArrivalTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} hr`;

            nearestStop.distance = formattedDistance;
            nearestStop.arrivalTime = formattedArrivalTime;
        }

        return {
            trip: {
                ...trip._doc,
                driverId: driver,
                careTakerId: caretaker
            },
            nearestStop
        };
    }




    async updateActiveTrip(groupId, tripId, travellerId, updateData) {
        const query = {
            groupId: Number(groupId),
            tripId: Number(tripId)
        }

        if (travellerId) {
            query['onBoaredTraveller.travellerId'] = Number(travellerId)
        }

        const updateTraveller = await ActiveTripsModel.findOneAndUpdate(
            query,
            updateData,
            { new: true }
        )

        return updateTraveller
    }

    async getActiveTripByStatus(groupId, status) {
        let query = { groupId: Number(groupId) }

        if (status) {
            query.status = status
        }

        const activeTrips = await ActiveTripsModel.find(query)
        return {
            data: {
                items: activeTrips
            }
        }
    }


}

module.exports = new ActiveTripsService(ActiveTripsModel, 'activetrips');
