const CareTakerModel = require("../schema/caretaker.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class CareTakerService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    
    async getBycareTakerId(careTakerId) {
        return this.execute(() => {
            return this.model.findOne({ careTakerId: careTakerId });
        });
    }

    async getAllDataByGroupId(groupId, query, page, limit) {
        try {
            const searchFilter = {
                groupId: groupId,
            };

            if (query.search) {
                const numericSearch = parseInt(query.search);
                if (!isNaN(numericSearch)) {
                    searchFilter.$or = [
                        { careTakername: { $regex: query.search, $options: "i" } },
                        { phoneNumber: { regex: query.search, $options: "i" } },
                        { careTakerId: numericSearch },
                    ];
                } else {
                    searchFilter.$or = [
                        { careTakername: { $regex: query.search, $options: "i" } },
                        { phoneNumber: { $regex: query.search, $options: "i" } },
                    ];
                }
            }

            if (query.careTakerId) {
                searchFilter.careTakerId = query.careTakerId;
            }

            if (query.careTakerName) {
                searchFilter.careTakerName = { $regex: query.name, $options: "i" };
            }

            if (query.phoneNumber) {
                searchFilter.phoneNumber = { $regex: query.phoneNumber, $options: "i" };
            }

            const count = await CareTakerModel.countDocuments(searchFilter);
            const totalPages = Math.ceil(count / limit);
            const skip = (page - 1) * limit;
            const services = await CareTakerModel.find(searchFilter)
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

    async deleteTripHistroyById(careTakerId, groupId) {
        try {
            return await CareTakerModel.deleteOne(
                careTakerId,
                groupId
            );
        } catch (error) {
            throw error;
        }
    }

    async updatecareTakerById(careTakerId, groupId, newData) {
        try {
            const updatedVisitor = await CareTakerModel.findOneAndUpdate(
                { careTakerId: careTakerId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedVisitor;
        } catch (error) {
            throw error;
        }
    }

}

module.exports = new CareTakerService(CareTakerModel, 'caretaker');
