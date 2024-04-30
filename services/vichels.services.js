const vichelsModel = require("../schema/vichels.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class vichelsService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.vichelsId) query.vichelsId = criteria.vichelsId;
        if (criteria.vichelsName)
            query.vichelsName = new RegExp(criteria.vichelsName, "i");
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deletevichels(vendorId, groupId) {
        try {
            return await this.dbModel.deleteOne({
                vichelsId: vichelsId,
                groupId: groupId,
            });
        } catch (error) {
            throw error;
        }
    }

    async updatevichelsId(vichelsId, groupId, newData) {
        try {
            const updatedvichels = await this.dbModel.findOneAndUpdate(
                { vichelsId: vichelsId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedvichels;
        } catch (error) {
            throw error;
        }
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.vichelsId) query.vichelsId = criteria.vichelsId;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteVendorById(vichelsId, groupId) {
        try {
            return await vichelsModel.deleteOne(vichelsId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updatevichelsById(vichelsId, groupId, newData) {
        try {
            const updatevichelsData = await vichelsModel.findOneAndUpdate(
                { vichelsId: vichelsId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatevichelsData;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new vichelsService(vichelsModel, "vichels");
