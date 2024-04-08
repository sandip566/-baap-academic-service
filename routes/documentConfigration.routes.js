const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/documentConfigration.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const documentConfigrationModel=require("../schema/documentConfigration.schema")
router.post(
    "/",
    checkSchema(require("../dto/visitor.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }

       const documntConfigurationId=Date.now()
       req.body.documntConfigurationId=documntConfigurationId
        req.body.documents.forEach((doc, index) => {
            const documentId = Date.now() + index; 
            doc.documentId = documentId;
        });
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    const groupId = req.params.groupId;
    const criteria = {
        documntConfigurationId: req.query.documntConfigurationId,
        userId: req.query.userId,
        roleId: req.query.roleId,
        addmissionId: req.query.addmissionId,
        academicYear:req.query.academicYear,
        empId:req.query.empId
    };
    const serviceResponse = await service.getAllDataByGroupId(
        groupId,
        criteria
    );
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/groupId/:groupId/documntConfigurationId/:documntConfigurationId", async (req, res) => {
    try {
        const documntConfigurationId = req.params.documntConfigurationId
        const groupId = req.params.groupId
        const Data = await service.deletedocumntConfigurationId({ documntConfigurationId: documntConfigurationId, groupId: groupId });
        if (!Data) {
            res.status(404).json({ error: 'documentConfigration data not found to delete' });
        } else {
            res.status(201).json(Data);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete("update/groupId/:groupId/documentId/:documentId", async (req, res) => {
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
