const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/academicyear.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const TokenService = require("../services/token.services");
const AcademicYearModel = require("../schema/academicyear.schema");

router.post(
    "/",
    checkSchema(require("../dto/academicyear.dto")), TokenService.checkPermission(["EMA2"]),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        if (req.body.currentYear === true) {
            await service.updateCurrentYearFalseByGroupId(req.body.groupId);
        }
        const existingRecord = await service.getByCourseIdAndGroupId(
            req.body.groupId,
            req.body.year
        );
        if (existingRecord.data) {
            return res.status(409).json({ error: "Data  Already Exists." });
        }
        if (req.body.startDate > req.body.endDate) {
            return res
                .status(404)
                .json({ error: "Start Year must be greater than End Year." });
        }
        const academicYearId = +Date.now();
        req.body.academicYearId = academicYearId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete(
    "/groupId/:groupId/academicYearId/:academicYearId",
    TokenService.checkPermission(["EMA4"]),
    async (req, res) => {
        try {
            const groupId = req.params.groupId;
            const academicYearId = req.params.academicYearId;
            const Data = await service.deleteByDataId(groupId, academicYearId);
            if (!Data) {
                res.status(404).json({ warning: "Data not found to delete" });
            } else {
                res.status(201).json(Data);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);
router.get(
    "/all/getByGroupId/:groupId",
    TokenService.checkPermission(["EMA1"]),
    async (req, res) => {
        const groupId = req.params.groupId;
        const criteria = {
            name: req.query.name,
        };
        const serviceResponse = await service.getAllDataByGroupId(
            groupId,
            criteria
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);
router.get(
    "/getAllDataUsingLink/all/getByGroupId/:groupId",
    async (req, res) => {
        const groupId = req.params.groupId;
        const criteria = {
            name: req.query.name,
        };
        const serviceResponse = await service.getAllDataByGroupId(
            groupId,
            criteria
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);
router.put(
    "/groupId/:groupId/academicYearId/:academicYearId",
    TokenService.checkPermission(["EMA3"]),
    async (req, res) => {
        try {
            const academicYearId = req.params.academicYearId;
            const groupId = req.params.groupId;
            const newData = req.body;
            const Data = await service.updateDataById(
                academicYearId,
                groupId,
                newData
            );
            if (!Data) {
                res.status(404).json({ warning: "Data not found to update" });
            } else {
                res.status(201).json(Data);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.get("/:id", TokenService.checkPermission(["EMA1"]), async (req, res) => {
    const serviceResponse = await service.getById(req.params.id);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get(
    "/academicYearId/:id",
    TokenService.checkPermission(["EMA1"]),
    async (req, res) => {
        const serviceResponse = await service.getByDataId(req.params.id);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);
router.get(
    "/getAcademicYearId/:academicYearId",
    async (req, res) => {
        const serviceResponse = await service.getByacademicYearId(req.params.academicYearId);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);
router.delete(
    "/:id",
    TokenService.checkPermission(["EMA4"]),
    async (req, res) => {
        const serviceResponse = await service.deleteById(req.params.id);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.put("/:id", TokenService.checkPermission(["EMA3"]), async (req, res) => {
    const serviceResponse = await service.updateById(req.params.id, req.body);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get(
    "/getByYear/:year",
    TokenService.checkPermission(["EMA1"]),
    async (req, res) => {
        try {
            const serviceResponse = await service.getByYear(req.params.year);
            requestResponsehelper.sendResponse(res, serviceResponse);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

router.delete("/deleteAll/group/:groupId", async (req, res) => {
    try {
        let groupId = req.params.groupId;
        const academicYearId = req.body.academicYear;

        if (!Array.isArray(academicYearId) || academicYearId.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or empty academicYearId array",
            });
        }

        const numericIds = academicYearId.map((id) => {
            const num = parseFloat(id);
            if (isNaN(num)) {
                throw new Error(`Invalid numeric ID: ${academicYearId}`);
            }
            return num;
        });

        const result = await AcademicYearModel.deleteMany({
            groupId: groupId,
            academicYearId: { $in: numericIds },
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "No records found to delete",
            });
        }

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} records deleted successfully`,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
});
module.exports = router;
