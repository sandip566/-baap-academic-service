const BedModel = require("../schema/bed.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class BedService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.status) query.status = criteria.status;
        if (criteria.name) query.name = new RegExp(criteria.name, "i");
        return this.preparePaginationAndReturnData(query, criteria);
    }
    async deleteByDataId(groupId, bedId) {
        try {
            const deleteData = await BedModel.deleteOne({
                groupId: groupId,
                bedId: bedId,
            });
            console.log(deleteData);
            return deleteData;
        } catch (error) {
            throw error;
        }
    }
    async updateDataById(bedId,groupId, newData) {
        try {
            const updateData = await BedModel.findOneAndUpdate(
                { bedId: bedId,groupId: groupId  },
                newData,
                { new: true }
            );
            return updateData;
        } catch (error) {
            throw error;
        }
    }
    async getByBedId(bedId) {
        return this.execute(() => {
            return BedModel.findOne({
                bedId: bedId,
            });
        });
    }
}

module.exports = new BedService(BedModel, 'bed');
