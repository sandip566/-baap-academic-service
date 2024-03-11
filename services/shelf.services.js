
const BaseService = require("@baapcompany/core-api/services/base.service");
const ShelfModel = require("../schema/shelf.schema");

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
                    // Numeric search
                    searchFilter.$or = [
                        { capacity: numericSearch }
                    ];
                } else {
                    // Non-numeric search
                    searchFilter.$or = [
                        { location: { $regex: criteria.search, $options: "i" } },
                        { shelfName: { $regex: criteria.search, $options: "i" } },
                        { shelfType: { $regex: criteria.search, $options: "i" } }

                    ];
                }
            }
            // if (criteria.shelfName) {
            //     searchFilter.shelfName = { $regex: criteria.shelfName, $options: "i" };
            // }
            return searchFilter;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async deleteShelfById(shelfId, groupId) {
        try {
            return await ShelfModel.deleteOne(shelfId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updateShelfById(shelfId, groupId, newData) {
        try {
            const updateShelfData = await ShelfModel.findOneAndUpdate({ shelfId: shelfId, groupId: groupId }, newData, { new: true });
            return updateShelfData;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new ShelfService(ShelfModel, 'shelf');
