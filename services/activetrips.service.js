const ActiveTripsModel = require("../schema/activetrips.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const BusRouteModel = require("../schema/busroutes.schema")
const CareTakerModel = require("../schema/caretaker.schema")
const DriverModel = require("../schema/driver.schema")
const VehicleModel = require("../schema/vehicle.schema")
const TravellerModel = require('../schema/traveller.schema')

class ActiveTripsService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async checkActiveTrip(groupId, routeId, driverId, careTakerId) {
        const trip = await ActiveTripsModel.findOne(
            {
                groupId: groupId,
                routeId: routeId,
                status: 'active'
            }
        )
        return trip
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

    async updateActiveTrip(groupId, tripId, newData) {
        try {
            const query = { groupId: Number(groupId), tripId: Number(tripId) };
            const { status, onBoaredTraveller } = newData;
            const updateFields = {};

            if (status) {
                updateFields.status = status;
            }

            if (onBoaredTraveller && Array.isArray(onBoaredTraveller) && onBoaredTraveller.length > 0) {
                for (const traveller of onBoaredTraveller) {
                    const updateResult = await ActiveTripsModel.updateOne(
                        {
                            groupId: Number(groupId),
                            tripId: Number(tripId),
                            'onBoaredTraveller.travellerId': traveller.travellerId
                        },
                        {
                            $set: {
                                'onBoaredTraveller.$.inTime': traveller.inTime,
                                'onBoaredTraveller.$.location': traveller.location,
                                'onBoaredTraveller.$.outTime': traveller.outTime
                            }
                        }
                    );

                    if (updateResult.matchedCount === 0) {
                        updateFields.$push = updateFields.$push || { onBoaredTraveller: { $each: [] } };
                        updateFields.$push.onBoaredTraveller.$each.push(traveller);
                    }
                }
            }

            if (Object.keys(updateFields).length > 0) {
                const options = { new: true, runValidators: true };
                const updatedTrip = await ActiveTripsModel.findOneAndUpdate(query, updateFields, options);
                return updatedTrip;
            } else {
                const updatedTrip = await ActiveTripsModel.findOne(query);
                return updatedTrip;
            }

        } catch (error) {
            console.error('Error updating active trip:', error);
            throw error;
        }
    }

    async getActiveTrip(groupId, tripId, lat, long) {
        let query = { groupId: Number(groupId), tripId: Number(tripId) };

        const trip = await ActiveTripsModel.findOne(query);

        if (!trip) {
            return null;
        }

        const lastLocation = trip.currentLocation[trip.currentLocation.length - 1];

        if (!lastLocation || lastLocation.lat !== parseFloat(lat) || lastLocation.long !== parseFloat(long)) {
            trip.currentLocation.push({ lat: parseFloat(lat), long: parseFloat(long) });
        }

        const updatedTrip = await trip.save();

        const driver = await DriverModel.findOne({ groupId: Number(groupId), driverId: trip.driverId });
        const caretaker = await CareTakerModel.findOne({ groupId: Number(groupId), careTakerId: trip.careTakerId });
        const vehicle = await VehicleModel.findOne({ groupId: Number(groupId), vehicleId: trip.vehicleId });

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
        const stopId = nearestStop.stopId
        const traveller = await TravellerModel.find({ groupId: Number(groupId), stopId: stopId })

        const onBoardTravellers = trip.onBoaredTraveller || [];
        const onBoardTravellersCount = onBoardTravellers.filter(traveller => traveller.inTime).length;

        return {
            trip: {
                ...trip._doc,
                driverId: driver,
                careTakerId: caretaker,
                routeId: route,
                vehicleId: vehicle,
                nearestStopTravellers: traveller,
                onBoardTravellersCount: onBoardTravellersCount,
                nearestStop: nearestStop
            },
        };
    }

    async getActiveTrips(groupId, userId) {
        const query = {
            groupId: Number(groupId),
            userId: Number(userId)
        };
        const [traveller] = await TravellerModel.find(query).select('routeId').exec();

        if (!traveller) {
            return {
                message: "No traveler found with the given criteria",
                data: []
            };
        }

        const routeId = traveller.routeId;

        const activeTrip = await ActiveTripsModel.aggregate([
            {
                $match: {
                    groupId: Number(groupId),
                    routeId: routeId,
                    status: 'active'
                }
            },
            {
                $lookup: {
                    from: 'busroutes',
                    localField: 'routeId',
                    foreignField: 'routeId',
                    as: 'routeDetails'
                }
            },
            {
                $unwind: {
                    path: '$routeDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    groupId: 1,
                    tripId: 1,
                    startTime: 1,
                    'routeDetails.number': 1,
                    'routeDetails.routeId': 1
                }
            }
        ]);

        if (activeTrip.length === 0) {
            return {
                message: "No active trip found for this route",
                data: []
            };
        }

        const tripData = this.getActiveTrip(query)

        return {
            message: "Active trip found",
            data: activeTrip
        };
    }

    async getActiveTripByStatus(groupId, status, page = 1, limit = 10) {
        try {
            let query = { groupId: Number(groupId) };
    
            if (status) {
                query.status = status;
            }
    
            const aggregateQuery = [
                {
                    $match: query
                },
                {
                    $lookup: {
                        from: 'busroutes',
                        localField: 'routeId',
                        foreignField: 'routeId',
                        as: 'routeDetails'
                    }
                },
                {
                    $unwind: {
                        path: '$routeDetails',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        routeId: {
                            name: "$routeDetails.name",
                            routeId: "$routeDetails.routeId"
                        }
                    }
                },
                {
                    $project: {
                        routeDetails: 0
                    }
                },
                {
                    $skip: (page - 1) * limit
                },
                {
                    $limit: limit
                }
            ];
    
            const activeTrips = await ActiveTripsModel.aggregate(aggregateQuery);
    
            const totalCount = await ActiveTripsModel.countDocuments(query);
    
            return {
                data: {
                    items: activeTrips,
                    totalPages: Math.ceil(totalCount / limit),
                    currentPage: page
                }
            };
        } catch (error) {
            throw new Error("Error in getActiveTripByStatus function: " + error.message);
        }
    }
    
    

    async getTrip(groupId, tripId) {
        try {
            let query = { groupId: Number(groupId), tripId: tripId };
            const activeTrip = await ActiveTripsModel.findOne(query);
    
            if (!activeTrip) {
                throw new Error('No active trip found.');
            }

            if (!activeTrip.currentLocation || activeTrip.currentLocation.length === 0) {
                throw new Error('No current location data available.');
            }
    
            const onBoaredTravellers = await Promise.all(
                activeTrip.onBoaredTraveller.map(async (traveller) => {
                    const travellerDetails = await TravellerModel.findOne({ groupId: groupId, travellerId: traveller.travellerId });
                    if (!travellerDetails) {
                        throw new Error(`No traveller found with travellerId: ${traveller.travellerId}`);
                    }
                    return {
                        ...traveller,
                        travellerDetails
                    };
                })
            );
    
            const lastLocation = activeTrip.currentLocation[activeTrip.currentLocation.length - 1];
    
            if (!lastLocation || !lastLocation.lat || !lastLocation.long) {
                throw new Error('Invalid or missing location data.');
            }
    
            const currentLocationData = {
                latitude: parseFloat(lastLocation.lat),
                longitude: parseFloat(lastLocation.long)
            }
    
            const nearestStop = await this.findNearestBusStop(groupId, activeTrip.routeId, currentLocationData);
    
            const routeDetails = await BusRouteModel.findOne({ routeId: activeTrip.routeId });
            const vehicleDetails = await VehicleModel.findOne({ vehicleId: activeTrip.vehicleId });
            const driverDetails = await DriverModel.findOne({ driverId: activeTrip.driverId });
            const caretakerDetails = await CareTakerModel.findOne({ careTakerId: activeTrip.careTakerId });
    
            return {
                data: {
                    activeTrip: {
                        ...activeTrip.toObject(),
                        onBoaredTraveller: onBoaredTravellers,
                        routeDetails: routeDetails,
                        vehicleDetails: vehicleDetails,
                        driverDetails: driverDetails,
                        caretakerDetails: caretakerDetails
                    },
                    nearestStop
                }
            };
        } catch (error) {
            throw new Error("Error in getTrip : " + error.message);
        }
    }
    
    
    

    async findNearestBusStop(groupId, routeId, currentLocation) {
        try {
            const busRoute = await BusRouteModel.findOne({ groupId: Number(groupId), routeId: Number(routeId) });

            if (!busRoute) {
                throw new Error('No bus route found.');
            }

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

            for (const stop of busRoute.stopDetails) {
                const stopLocation = {
                    latitude: stop.location.lattitude,
                    longitude: stop.location.longitude
                };
                const distance = calculateDistance(
                    currentLocation.latitude,
                    currentLocation.longitude,
                    stopLocation.latitude,
                    stopLocation.longitude
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    nearestStop = {
                        _id: stop._id,
                        stopId: stop.stopId,
                        stopName: stop.stopName,
                        fees: stop.fees,
                        location: {
                            lattitude: stop.location.lattitude,
                            longitude: stop.location.longitude
                        },
                        distance: distance.toFixed(2) + ' km',
                        arrivalTime: this.calculateArrivalTime(distance)
                    };
                }
            }

            return nearestStop;
        } catch (error) {
            throw new Error("Error in findNearestBusStop function: " + error.message);
        }
    }

    calculateArrivalTime(distance) {
        const averageSpeed = 30;
        const arrivalTimeInHours = distance / averageSpeed;
        const hours = Math.floor(arrivalTimeInHours);
        const minutes = Math.round((arrivalTimeInHours - hours) * 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} hr`;
    }

}

module.exports = new ActiveTripsService(ActiveTripsModel, 'activetrips');
