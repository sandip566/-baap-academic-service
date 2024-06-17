const BaseService = require("@baapcompany/core-api/services/base.service");
const feesTemplateModel = require("../schema/feesTemplate.schema");
const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");

class Service extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async getAllDataByGroupId(groupId, criteria) {
        const matchStage = {
            $match: {
                groupId: Number(groupId),
            }
        };

        if (criteria.feesTemplateId) {
            matchStage.$match.feesTemplateId = criteria.feesTemplateId;
        }
        if (criteria.isHostel) {
            matchStage.$match.isHostel = criteria.isHostel;
        }
        if (criteria.type) {
            matchStage.$match.type = criteria.type;
        }
        if (criteria.isShowInAccounting) {
            matchStage.$match.isShowInAccounting = criteria.isShowInAccounting;
        }

        const aggregationPipeline = [
            matchStage,
            {
                $lookup: {
                    from: 'feestemplatetypes',
                    localField: 'type',
                    foreignField: 'feesTemplateTypeId',
                    as: 'type'
                }
            },
            {
                $unwind: {
                    path: '$type',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        ];

        if (criteria.pageNumber && criteria.pageSize) {
            const page = criteria.pageNumber;
            const pageSize = criteria.pageSize;
            const skip = (page - 1) * pageSize;

            aggregationPipeline.push(
                { $skip: skip },
                { $limit: pageSize }
            );
        }

        const results = await feesTemplateModel.aggregate(aggregationPipeline).exec();
        const totalResults = await feesTemplateModel.countDocuments(matchStage.$match).exec();

        return {
            status: "Success",
            data: {
                items: results,
                totalItemsCount: totalResults,
            }
        };
    }

    async getByfeesTemplateId(feesTemplateId) {
        const result = await this.model.findOne({ feesTemplateId });
        return new ServiceResponse({
            data: result,
        });
    }

    async deletefeesTemplateById(groupId, feesTemplateId) {
        try {
            return await feesTemplateModel.deleteOne({
                groupId: groupId,
                feesTemplateId: feesTemplateId,
            });
        } catch (error) {
            throw error;
        }
    }

    async updatefeesTemplateById(feesTemplateId, groupId, newData) {
        try {
            const updatefeesTemplate = await feesTemplateModel.findOneAndUpdate(
                { feesTemplateId: feesTemplateId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatefeesTemplate;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new Service(feesTemplateModel, "feesTemplate");
