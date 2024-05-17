const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
const HostelAdmissionModel = require("../schema/hosteladmission.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const HostelFeesInstallmentModel = require("../schema/hostelfeesinstallment.schema");

class HostelAdmissionService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async getAllDataByGroupId(groupId, query, page, limit, reverseOrder = true) {
        try {
            const searchFilter = {
                groupId: Number (groupId),
            };
    
            if (query.search) {
                const numericSearch = parseInt(query.search);
                if (!isNaN(numericSearch)) {
                    searchFilter.$or = [
                        { firstName: { $regex: query.search, $options: "i" } },
                        { lastName: { $regex: query.search, $options: "i" } },
                        { phoneNumber: numericSearch },
                        { hostelAdmissionId: numericSearch },
                    ];
                } else {
                    searchFilter.$or = [
                        { firstName: { $regex: query.search, $options: "i" } },
                        { lastName: { $regex: query.search, $options: "i" } },
                    ];
                }
            }
    
            if (query.phoneNumber) {
                searchFilter.phoneNumber = query.phoneNumber;
            }
    
            if (query.academicYear) {
                searchFilter.academicYear = query.academicYear;
            }
            
            if (query.roleId) {
                searchFilter.roleId = query.roleId;
            }
    
            if (query.firstName) {
                searchFilter.firstName = {
                    $regex: query.firstName,
                    $options: "i",
                };
            }
    
            if (query.lastName) {
                searchFilter.lastName = {
                    $regex: query.lastName,
                    $options: "i",
                };
            }
    
            if (query.admissionStatus) {
                searchFilter.admissionStatus = {
                    $regex: query.admissionStatus,
                    $options: "i",
                };
            }
    
            if (query.status) {
                searchFilter.status = {
                    $regex: query.status,
                    $options: "i",
                };
            }
    
            // const skip = (page - 1) * perPage;
            // const limit = perPage;
            const currentPage = page;
            const perPage = limit;
            const skip = (currentPage - 1) * perPage;

            const data = await HostelAdmissionModel.aggregate([
                { $match: searchFilter },
                { $unwind: "$feesDetails" },
                {
                    $lookup: {
                        from: "feestemplates", // The name of the fees template collection
                        localField: "feesDetails.feesTemplateId",
                        foreignField: "feesTemplateId",
                        as: "feesTemplateDetails"
                    }
                },
                { $unwind: "$feesTemplateDetails" },
                {
                    $group: {
                        _id: "$_id",
                        doc: { $first: "$$ROOT" },
                        feesDetails: {
                            $push: {
                                feesTemplateId: "$feesDetails.feesTemplateId",
                                installment: "$feesDetails.installment",
                                feesDetailsId: "$feesDetails.feesDetailsId",
                                status: "$feesDetails.status",
                                hostelFeesDetailsId: "$feesDetails.hostelFeesDetailsId",
                                feesTemplateDetails: "$feesTemplateDetails"
                            }
                        }
                    }
                },
                {
                    $replaceRoot: {
                        newRoot: {
                            $mergeObjects: ["$doc", { feesDetails: "$feesDetails" }]
                        }
                    }
                },
                { $sort: { createdAt: reverseOrder ? -1 : 1 } },
                { $skip: skip },
                { $limit: perPage }
            ]).exec()
    
            const totalItemsCount = await HostelAdmissionModel.countDocuments(searchFilter);
    
            const response = {
                status: "Success",
                data: {
                    items: data,
                    totalItemsCount: totalItemsCount,
                },
            };
            return response;
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    }
    
    async getByHostelId(hostelAdmissionId) {
        return this.execute(() => {
            return HostelAdmissionModel.findOne({
                hostelAdmissionId: hostelAdmissionId,
            });
        });
    }
    async getByAddmissionIdData(hostelAdmissionId) {
        return this.execute(() => {
            return this.model.findOne({ hostelAdmissionId: hostelAdmissionId });
        });
    }
    async updateUser(hostelAdmissionId, groupId, data) {
        try {
            const resp = await 
            HostelFeesInstallmentModel.findOneAndUpdate(
                { hostelAdmissionId: hostelAdmissionId, groupId: groupId },

                data,
                { upsert: true, new: true }
            );

            return new ServiceResponse({
                data: resp,
            });
        } catch (error) {
            console.log(error);
            return new ServiceResponse({
                isError: true,
                message: error.message,
            });
        }
    }
    async updateDataById(hostelAdmissionId, groupId, newData) {
        try {
            const updatedData = await HostelAdmissionModel.findOneAndUpdate(
                { hostelAdmissionId: hostelAdmissionId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async deleteByDataId(hostelAdmissionId, groupId) {
        try {
            const deleteData = await HostelAdmissionModel.deleteOne({
                hostelAdmissionId: hostelAdmissionId,
                groupId: groupId,
            });
            return deleteData;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new HostelAdmissionService(HostelAdmissionModel, 'hosteladmission');
