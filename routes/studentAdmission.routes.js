const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/studentAdmission.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const { default: mongoose } = require("mongoose");

router.post(
    "/",
    checkSchema(require("../dto/studentAdmission.dto")),
    async (req, res, next) => {
        try {
            if (ValidationHelper.requestValidationErrors(req, res)) {
                return;
            }
            const studentAdmissionId = +Date.now();
            req.body.studentAdmissionId = studentAdmissionId;
            const serviceResponse = await service.create(req.body);
            requestResponsehelper.sendResponse(res, serviceResponse);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);
router.post("/data/save", async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }
    // const addmissionId = +Date.now();
    // req.body.addmissionId = addmissionId;

    if (req.body.addmissionId) {
        const existingDocument = await service.getByaddmissionId(
            req.body.addmissionId
        );
        console.log(existingDocument);

        if (existingDocument) {
            if (!req.body.documents || req.body.documents.length === 0) {
                req.body.documents = [];
            } else {
                req.body.documents = req.body.documents.map((addressData) => {
                    const documentId =
                        +Date.now() + Math.floor(Math.random() * 1000);
                    return {
                        _id: new mongoose.Types.ObjectId(),
                        documentId: documentId,
                        documents: addressData,
                    };
                });
            }
            if (
                !req.body.accountDetails ||
                req.body.accountDetails.length === 0
            ) {
                req.body.accountDetails = [];
            } else {
                req.body.contactDetails = req.body.contactDetails.map(
                    (paymentDetailsData) => {
                        const contactId = +Date.now();
                        return {
                            _id: new mongoose.Types.ObjectId(),
                            contactId: contactId,
                            contactDetails: paymentDetailsData,
                        };
                    }
                );
            }

            const serviceResponse = await service.updateUser(
                req.body.addmissionId,
                req.body
            );
            console.log("serviceResponse", serviceResponse);
            requestResponsehelper.sendResponse(res, serviceResponse);
        } else {
            const serviceResponse = await service.create(req.body);
            console.log(serviceResponse);
            requestResponsehelper.sendResponse(res, serviceResponse);
        }
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const serviceResponse = await service.deleteById(req.params.id);
        requestResponsehelper.sendResponse(res, serviceResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const serviceResponse = await service.updateById(
            req.params.id,
            req.body
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const serviceResponse = await service.getById(req.params.id);
        requestResponsehelper.sendResponse(res, serviceResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/all/studentsAddmision", async (req, res) => {
    try {
        const serviceResponse = await service.getAllByCriteria({});
        requestResponsehelper.sendResponse(res, serviceResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const criteria = {
            studentsAddmisionId: req.query.studentsAddmisionId,
        };
        const serviceResponse = await service.getAllDataByGroupId(
            groupId,
            criteria
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete(
    "/groupId/:groupId/studentAdmissionId/:studentAdmissionId",
    async (req, res) => {
        try {
            const studentAdmissionId = req.params.studentAdmissionId;
            const groupId = req.params.groupId;
            const Data = await service.deleteByStudentsAddmisionId({
                studentAdmissionId: studentAdmissionId,
                groupId: groupId,
            });
            if (!Data) {
                res.status(404).json({ error: "data not found to delete" });
            } else {
                res.status(201).json(Data);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.put(
    "/groupId/:groupId/studentAdmissionId/:studentAdmissionId",
    async (req, res) => {
        try {
            const studentAdmissionId = req.params.studentAdmissionId;
            const groupId = req.params.groupId;
            const newData = req.body;
            const updatedData = await service.updateStudentsAddmisionById(
                studentAdmissionId,
                groupId,
                newData
            );
            if (!updatedData) {
                res.status(404).json({ error: " not found to update" });
            } else {
                res.status(201).json(updatedData);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

module.exports = router;
