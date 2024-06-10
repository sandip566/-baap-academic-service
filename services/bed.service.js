const BedModel = require("../schema/bed.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class BedService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: Number(groupId),
        };
        if (criteria.status) query.status = criteria.status;
        if (criteria.numberOfBed) query.numberOfBed = criteria.numberOfBed;
        if (criteria.name) query.name = new RegExp(criteria.name, "i");
        const totalItemsCount = await BedModel.countDocuments(query)
        const bed = await BedModel.aggregate([
            { $match: query },
            { $sort: { createdAt: -1 } }
        ])

        return {
            status: "Success",
            data: {
                items: bed,
                totalItemsCount,
            },
        }
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
    async updateDataById(bedId, groupId, newData) {
        try {
            const updateData = await BedModel.findOneAndUpdate(
                { bedId: bedId, groupId: groupId },
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
