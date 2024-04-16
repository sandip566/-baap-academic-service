const BaseService = require("@baapcompany/core-api/services/base.service");
const productModel = require("../schema/product.schema");

class Service extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        criteria.pageSize = 10;
        if (criteria.productId) query.productId = criteria.productId;
        return this.preparePaginationAndReturnData(query, criteria);
    }

    async deleteProductById(productId, groupId) {
        try {
            return await productModel.deleteOne(productId, groupId);
        } catch (error) {
            throw error;
        }
    }

    async updateProductById(productId, groupId, newData) {
        try {
            const updateData = await productModel.findOneAndUpdate(
                { productId: productId, groupId: groupId },
                newData,
                { new: true }
            );
            return updateData;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new Service(productModel, "product");
