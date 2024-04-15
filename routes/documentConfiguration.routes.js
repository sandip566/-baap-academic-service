const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/documentConfiguration.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const documentConfigurationModel = require("../schema/documentConfiguration.schema")
const documntModel = require("../schema/document.schema")
router.post(
    "/",
    checkSchema(require("../dto/documentCongigration.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const documntConfigurationId = Date.now()
        req.body.documntConfigurationId = documntConfigurationId
        req.body.documents.forEach((doc, index) => {
            const documentId = Date.now() + index;
            doc.documentId = documentId;
        });
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    try {
        const groupId = req.params.groupId;

        const criteria = {
            documntConfigurationId: req.query.documntConfigurationId,
            userId: req.query.userId,
            roleId: req.query.roleId,
            addmissionId: req.query.addmissionId,
            academicYear: req.query.academicYear,
            empId: req.query.empId
        };
        const searchFilter = service.getAllDataByGroupId(groupId, criteria);

        const documentConfigurations = await documentConfigurationModel.find(searchFilter);

        let filteredDocuments = documentConfigurations;
        let populatedDocuments = [];
        if (criteria.roleId) {
            filteredDocuments = documentConfigurations.filter(documentConfiguration => {
                return documentConfiguration.roleId == criteria.roleId;
            });
            populatedDocuments = await Promise.all(
                filteredDocuments.map(async (documentConfiguration) => {
                    const documents = await documntModel.find({
                        roleId: documentConfiguration.roleId,
                    });
                    return { ...documentConfiguration._doc, documents };
                })
            );
        }
        if (criteria.roleId && criteria.userId) {
            filteredDocuments = documentConfigurations.filter(documentConfiguration => {
                return documentConfiguration.userId == criteria.userId && documentConfiguration.roleId == criteria.roleId;
            });
            populatedDocuments = await Promise.all(
                filteredDocuments.map(async (documentConfiguration) => {
                    const documents = await documntModel.find({
                        userId: documentConfiguration.userId,
                    });
                    return { ...documentConfiguration._doc, documents };
                })
            );
        }
        else {
            if (criteria.roleId) {
                filteredDocuments = documentConfigurations.filter(documentConfiguration => {
                    return documentConfiguration.roleId == criteria.roleId;
                });
            } else if (criteria.userId) {
                filteredDocuments = documentConfigurations.filter(documentConfiguration => {
                    return documentConfiguration.userId == criteria.userId;
                });
            }
        }
        const count = filteredDocuments.length;
        res.json({
            data: {
                items: filteredDocuments,
                populatedDocuments: populatedDocuments,
                totalItem: count,
            }
        });
    } catch (err) {
        throw err
    }

})
router.delete("/groupId/:groupId/documntConfigurationId/:documntConfigurationId", async (req, res) => {
    try {
        const documntConfigurationId = req.params.documntConfigurationId
        const groupId = req.params.groupId
        const Data = await service.deletedocumntConfigurationId({ documntConfigurationId: documntConfigurationId, groupId: groupId });
        if (!Data) {
            res.status(404).json({ error: 'documentConfiguration data not found to delete' });
        } else {
            res.status(201).json(Data);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete("/groupId/:groupId/documentId/:documentId", async (req, res) => {
    try {
        const { groupId, documentId } = req.params;

        const deletedDocument = await service.deleteById({ groupId, documentId });

        if (!deletedDocument) {
            return res.status(404).json({ error: 'Document not found with the provided document ID and group ID.' });
        }

        return res.status(200).json({ message: 'Document deleted successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.put("/groupId/:groupId/documntConfigurationId/:documntConfigurationId", async (req, res) => {
    try {
        const documntConfigurationId = req.params.documntConfigurationId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const updateData = await service.updateDocumntConfigrationByConfigrationId(documntConfigurationId, groupId, newData);
        if (!updateData) {
            res.status(404).json({ error: 'data not found to update' });
        } else {
            res.status(200).json(updateData);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put("/groupId/:groupId/documentId/:documentId", async (req, res) => {
    try {
        const { groupId, documentId } = req.params;
        const updateData = req.body;
        const updatedDocument = await service.updateById({ groupId, documentId, updateData });

        if (!updatedDocument) {
            return res.status(404).json({ error: 'Document not found with the provided document ID.' });
        }
        return res.status(200).json({ message: 'Document updated successfully.', updatedDocument });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = router;
