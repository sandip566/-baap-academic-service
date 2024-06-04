const DriverRoutesModel = require("../schema/driverroutes.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const BusRoutesModel = require("../schema/busroutes.schema");
const DriverModel = require("../schema/driver.schema");
class DriverRoutesService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getByBusRouteId(groupId, driverRouteId) {
        console.log("query", {
            groupId: groupId,
            driverRouteId: driverRouteId,
        });
        let driverRoutes = await DriverRoutesModel.findOne({
            groupId: Number(groupId),
            driverRouteId: Number(driverRouteId),
        });
        console.log("driverRoutes", driverRoutes);
        const routeId = driverRoutes.routeId;
        console.log("data", routeId);
        if (!routeId) {
            throw new Error("routeId not found.");
        }
        let route = await BusRoutesModel.findOne({
            groupId: groupId,
            routeId: routeId,
        });

        const driverId = route.driverId;
        if (!driverId) {
            throw new Error("driverId not found.");
        }
        let driver = await DriverModel.findOne({
            groupId: groupId,
            driverId: driverId,
        });

        let responseData = {
            status: "Success",
            data: {
                driverRoutes: {
                    ...driverRoutes.toObject(),
                    routeId: route.toObject(),
                    driverId: driver.toObject(),
                },
            },
        };

        return responseData;
    }
}

module.exports = new DriverRoutesService(DriverRoutesModel, "driverroutes");
