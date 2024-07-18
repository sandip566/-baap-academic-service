const transportcoordinatorModel = require("../schema/transportcoordinator.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class transportcoordinatorervice extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async findByUserId(groupId, empId) {
        try {
            const user = await transportcoordinatorModel.findOne({ groupId, empId });
            return user;
        } catch (error) {
            console.error("Error finding user by empId:", error);
            throw new Error("Error finding user by empId: " + error.message);
        }
    }

    async getBytransportCoordinatorId(transportCoordinatorId) {
        return this.execute(() => {
            return this.model.findOne({ transportCoordinatorId: transportCoordinatorId });
        });
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

            const count = await transportcoordinatorModel.countDocuments(searchFilter);
            const totalPages = Math.ceil(count / limit);
            const skip = (page - 1) * limit;
            const services = await transportcoordinatorModel.find(searchFilter)
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

    async deletetransportcoordinatorById(transportCoordinatorId, groupId) {
        try {
            return await transportcoordinatorModel.deleteOne(
                transportCoordinatorId,
                groupId
            );
        } catch (error) {
            throw error;
        }
    }

    async updateTransportCoordinatorById(transportCoordinatorId, groupId, newData) {
        try {
            const updatedVisitor = await transportcoordinatorModel.findOneAndUpdate(
                { transportCoordinatorId: transportCoordinatorId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedVisitor;
        } catch (error) {
            throw error;
        }
    }


}
module.exports = new transportcoordinatorervice(transportcoordinatorModel, "transportcoordinator");
