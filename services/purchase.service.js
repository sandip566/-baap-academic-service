const PurchaseModel = require("../schema/purchase.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");

class PurchaseService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }
    async updateTransactionById(purchaseId, groupId, newData) {
        try {
            const updatedData = await PurchaseModel.findOneAndUpdate(
                { purchaseId: purchaseId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedData;
        } catch (error) {
            throw error;
        }
    }

    async deleteByTransactionId(purchaseId, groupId) {
        try {
            return await PurchaseModel.deleteOne(purchaseId, groupId);
        } catch (error) {
            throw error;
        }
    }
    async getAllDataByGroupId(groupId, criteria, skip, limit) {
        try {
            const searchFilter = {
                groupId: groupId,
            };

            if (criteria.search) {
                const numericSearch = parseInt(criteria.search);
                if (!isNaN(numericSearch)) {
                    searchFilter.$or = [
                        { vendorId: numericSearch },
                        { purchaseId: numericSearch },
                        { unitPrice: numericSearch },
                        { quantity: numericSearch },
                    ];
                } else {
                    searchFilter.$or = [
                        {
                            book: {
                                $regex: new RegExp(criteria.search, "i"),
                            },
                        },
                        {
                            orderStatus: {
                                $regex: new RegExp(criteria.search, "i"),
                            },
                        },
                    ];
                }
            }
            if (criteria.quantity) {
                searchFilter.quantity = criteria.quantity;
            }
            if (criteria.unitPrice) {
                searchFilter.unitPrice = criteria.unitPrice;
            }
            if (criteria.orderStatus) {
                searchFilter.orderStatus = {
                    $regex: new RegExp(criteria.orderStatus, "i"),
                };
            }
            if (criteria.book) {
                searchFilter.book = {
                    $regex: new RegExp(criteria.book, "i"),
                };
            }

            return { searchFilter };
        } catch (error) {
            console.error("Error in getAllDataByGroupId:", error);
            throw new Error("An error occurred while processing the request.");
        }
    }
}

module.exports = new PurchaseService(PurchaseModel, "purchase");
