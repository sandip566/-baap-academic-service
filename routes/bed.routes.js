const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/bed.service");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const TokenService = require("../services/token.services");

router.post(
    "/",
    checkSchema(require("../dto/bed.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        const bedId = +Date.now();
        req.body.bedId = bedId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.delete("/:id", async (req, res) => {
    const serviceResponse = await service.deleteById(req.params.id);

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.put("/:id", async (req, res) => {
    const serviceResponse = await service.updateById(req.params.id, req.body);

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/:id", async (req, res) => {
    const serviceResponse = await service.getById(req.params.id);

    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.get("/all/bed", async (req, res) => {
    const serviceResponse = await service.getAllByCriteria({});

    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.get(
    "/all/getByGroupId/:groupId",
    //TokenService.checkPermission(["EMA1"]),
    async (req, res) => {
        const groupId = req.params.groupId;
        const criteria = {
            name: req.query.name,
            status: req.query.status,
            numberOfBed: req.query.numberOfBed,
            description:req.query.description,
            search:req.query.search,
            page:req.query.page,
            limit:req.query.limit
        };
        const serviceResponse = await service.getAllDataByGroupId(
            groupId,
            criteria
        );
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
    
);
router.delete(
    "/groupId/:groupId/bedId/:bedId",
    TokenService.checkPermission(["EMA4"]),
    async (req, res) => {
        try {
            const groupId = req.params.groupId;
            const bedId = req.params.bedId;
            const Data = await service.deleteByDataId(groupId, bedId);
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
router.put(
    "/groupId/:groupId/bedId/:bedId",
    TokenService.checkPermission(["EMA3"]),
    async (req, res) => {
        try {
            const bedId = req.params.bedId;
            const groupId = req.params.groupId;
            const newData = req.body;
            const Data = await service.updateDataById(
                bedId,
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
router.get(
    "/getBedId/:bedId",
    async (req, res) => {
        const serviceResponse = await service.getByBedId(req.params.bedId);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);
module.exports = router;
