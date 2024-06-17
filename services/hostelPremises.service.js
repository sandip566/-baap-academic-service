const HostelModel = require("../schema/hostelPremises.schema.js");
const BaseService = require("@baapcompany/core-api/services/base.service");
const studentAddmissionModel = require("../schema/studentAdmission.schema.js");

class HostelService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getDataById(hostelId) {
        return this.execute(() => {
            return HostelModel.findOne({ hostelId: hostelId });
        });
    }
async getAllDataByGroupId(groupID, criteria) {
    try {
        const groupId = parseInt(groupID);
        if (isNaN(groupId)) {
            throw new Error("Invalid groupID");
        }
        const searchFilter = { groupId };
        const aggregationPipeline = [
            {
                $match: searchFilter,
            },
        ];
        if (criteria.search) {
            const searchRegex = new RegExp(criteria.search.trim(), "i");
            aggregationPipeline.push({
                $match: {
                    $or: [
                        { hostelId: { $eq: parseInt(criteria.search) } },
                        { hostelName: searchRegex },
                        { numberOfFloors: { $eq: parseInt(criteria.search) } },
                        { nameOfHead: searchRegex },
                        { "location.name": searchRegex },
                    ],
                },
            });
        }
        const pageNumber = parseInt(criteria.pageNumber) || 1;
        const pageSize = parseInt(criteria.pageSize) || 10;
        aggregationPipeline.push(
            { $skip: (pageNumber - 1) * pageSize },
            { $limit: pageSize }
        );
        const populatedBook = await HostelModel.aggregate(
            aggregationPipeline
        );
        const totalCount = await HostelModel.countDocuments(searchFilter);
        return {
            status: "Success",
            data: {
                items: populatedBook,
            },
            totalCount,
        };
    } catch (error) {
        console.error("Error in getAllDataByGroupId:", error);
        throw new Error(
            "An error occurred while processing the request. Please try again later."
        );
    }
}

    async getByHostelId(hostelId) {
        return this.execute(() => {
            return HostelModel.findOne({
                hostelId: hostelId,
            });
        });
    }

    async updateDataById(hostelId, groupId, newData) {
        try {
            const updatedData = await HostelModel.findOneAndUpdate(
                { hostelId: hostelId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async deleteByDataId(hostelId, groupId) {
        try {
            const deleteData = await HostelModel.deleteOne({
                hostelId: hostelId,
                groupId: groupId,
            });
            return deleteData;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new HostelService(HostelModel, "hostelPremises");
