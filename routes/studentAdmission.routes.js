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

router.get("/all", async (req, res) => {
    try {
        const serviceResponse = await service.getAllByCriteria({});
        requestResponsehelper.sendResponse(res, serviceResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/data/save", async (req, res, next) => {
    try {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }

        if (req.body.addmissionId) {
            const existingDocument = await service.getByaddmissionId(
                req.body.addmissionId
            );

            if (existingDocument) {
                req.body.documents = req.body.documents
                    ? req.body.documents.map((documentData) => {
                          const documentId =
                              +Date.now() + Math.floor(Math.random() * 1000);
                          return {
                              _id: new mongoose.Types.ObjectId(),
                              documentId: documentId,
                              documents: documentData,
                          };
                      })
                    : existingDocument.data?.documents || [];

                // req.body.feesDetails = req.body.feesDetails
                //     ? req.body.feesDetails.map((feesDetailsData) => {
                //           const feesDetailsId = +Date.now();
                //           return {
                //               _id: new mongoose.Types.ObjectId(),
                //               feesDetailsId: feesDetailsId,
                //               feesDetails: feesDetailsData,
                //           };
                //       })
                //     : existingDocument.data?.feesDetails || [];

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
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// router.post(
//     "/addInstallment/addmissionId/:addmissionId",
//     // checkSchema(require("../dto/villageDevelopmentCommitte/village-development-committe.dto")),
//     async (req, res, next) => {
//         if (ValidationHelper.requestValidationErrors(req, res)) {
//             return;
//         }
//         const serviceResponse = await service.addInstallment(
//             // req.params.groupId,
//             req.params.addmissionId,
//             req.body
//         );
//         console.log(serviceResponse);
//         requestResponsehelper.sendResponse(res, serviceResponse);
//     }
// );

router.delete(
    "/installmentDetails/addmissionId/:addmissionId/installmentId/:installmentId",

    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const serviceResponse = await service.deleteCompanyDetails(
            req.params.addmissionId,
            req.params.installmentId
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

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

router.get("/all/getByGroupId/:groupId", async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const criteria = {
            // phoneNumber: req.query.phoneNumber,
            first_name: req.query.first_name,
            phone_number: req.query.phone_number,
            last_name: req.query.last_name,
            search: req.query.search,
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
router.get(
    "/all/getAdmissionListing/groupId/:groupId/academicYear/:academicYear",
    async (req, res) => {
        try {
            const groupId = req.params.groupId;
            const academicYear = req.params.academicYear;
            const criteria = {};
            const serviceResponse = await service.getAdmissionListing(
                groupId,
                academicYear,
                criteria
            );
            requestResponsehelper.sendResponse(res, serviceResponse);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);
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
