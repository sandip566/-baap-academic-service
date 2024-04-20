const BaseService = require("@baapcompany/core-api/services/base.service");
const ShelfModel = require("../schema/shelf.schema");
const bookModel=require("../schema/books.schema")
class ShelfService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    getAllDataByGroupId(groupId, criteria) {
        try {
            const searchFilter = {
                groupId: groupId,
            };

            if (criteria.search) {
                const numericSearch = parseInt(criteria.search);
                if (!isNaN(numericSearch)) {
                    searchFilter.$or = [{ capacity: numericSearch }];
                } else {
                    searchFilter.$or = [
                        {
                            location: {
                                $regex: criteria.search,
                                $options: "i",
                            },
                        },
                        {
                            shelfName: {
                                $regex: criteria.search,
                                $options: "i",
                            },
                        },
                        {
                            shelfType: {
                                $regex: criteria.search,
                                $options: "i",
                            },
                        },
                    ];
                }
            }
            if (criteria.shelfName) {
                searchFilter.shelfName = {
                    $regex: criteria.shelfName,
                    $options: "i",
                };
            }
            if (criteria.location) {
                searchFilter.location = {
                    $regex: criteria.location,
                    $options: "i",
                };
            }
            if (criteria.shelfType) {
                searchFilter.shelfType = {
                    $regex: criteria.shelfType,
                    $options: "i",
                };
            }
            return searchFilter;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async deleteShelfById(shelfId, groupId) {
        try {
            const isShelfAssigned = await bookModel.exists({ shelfId: shelfId, groupId: groupId });
            if (isShelfAssigned) {
                return false;
            } else {
                const result = await ShelfModel.deleteOne({ shelfId: shelfId, groupId: groupId });
                console.log(result)
                return result;

            }
        } catch (error) {
            throw error;
        }
    }
    



    async updateShelfById(shelfId, groupId, newData) {
        try {
            const updateShelfData = await ShelfModel.findOneAndUpdate(
                { shelfId: shelfId, groupId: groupId },
                newData,
                { new: true }
            );
            return updateShelfData;
        } catch (error) {
            throw error;
        }
    }

    async getCount() {
        try {
            const totalShelf = await ShelfModel.countDocuments();
            const filledShelfs = await ShelfModel.countDocuments({
                availableCapacity: 0,
            });
            const availableShelfs = await ShelfModel.countDocuments({
                availableCapacity: { $gt: 0 },
            });
            const response = {
                totalShelf: totalShelf,
                fulledShelf: filledShelfs,
                availableShelfs: availableShelfs,
            };
            return response;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new ShelfService(ShelfModel, "shelf");
