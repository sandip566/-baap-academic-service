const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/studentAdmission.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const { default: mongoose } = require("mongoose");
const feesInstallmentServices = require("../services/feesInstallment.services");
const TokenService = require("../services/token.services");
const multer = require("multer");
const upload = multer();
const xlsx = require("xlsx");
const { isDate } = require("moment");
const Student=require("../schema/studentAdmission.schema")
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

router.get("/getByAddmissionId/:addmissionId", async (req, res, next) => {
    if (ValidationHelper.requestValidationErrors(req, res)) {
        return;
    }
    const serviceResponse = await service.getByAddmissionId(req.params.addmissionId);
    requestResponsehelper.sendResponse(res, serviceResponse);
});
router.get("/all", async (req, res) => {
    try {
        const serviceResponse = await service.getAllByCriteria({});
        requestResponsehelper.sendResponse(res, serviceResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
//original

router.post("/data/save", async (req, res, next) => {
    try {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }

        if (req.body.addmissionId) {
            const existingDocument = await service.getByAddmissionIdData(
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
                if (req.body.feesDetails) {
                    const installmentId = +Date.now();
                    req.body.installmentId = installmentId;

                    const updatedFeesDetails = req.body.feesDetails.map((feesDetail) => {
                        const installNo = +Date.now() + Math.floor(Math.random() * 1000) + 1;

                        const updatedInstallments = feesDetail.installment.map((installment) => {
                            const uniqueInstallNo = +Date.now() + Math.floor(Math.random() * 1000) + 1;
                            return {
                                ...installment,
                                installmentNo: uniqueInstallNo,
                                status:"pending"
                            };
                        });


                        return {
                            ...feesDetail,
                            installment: updatedInstallments,
                        };
                    });


                    req.body.feesDetails = updatedFeesDetails;

                    const feesinstallmentResponse = await feesInstallmentServices.updateUser(
                        req.body.addmissionId,
                        req.body.groupId,
                        req.body
                    );

                    console.log(feesinstallmentResponse);
                }


              
                const serviceResponse = await service.updateUser(
                    req.body.addmissionId,
                    req.body
                );

                // console.log("serviceResponse", serviceResponse);
                requestResponsehelper.sendResponse(res, serviceResponse);
            } else {
                const serviceResponse = await service.create(req.body);
                // console.log(serviceResponse);
                if (req.body.feesDetails) {
                    const installmentId = +Date.now();
                    req.body.installmentId = installmentId;
                    console.log(req.body.feesDetails);
                    const feesinstallment = await feesInstallmentServices.create(req.body);
                    console.log(feesinstallment);


                    const updatedInstallments = req.body.feesDetails.map((detail, index) => ({
                        ...detail,
                        installNo: index + 1,
                    }));
                    console.log(updatedInstallments);
                    req.body.feesDetails = updatedInstallments;
                }

                // if(req.body.feesDetails){
                // const installmentId = +Date.now();
                // req.body.installmentId = installmentId;
                // const feesinstallment = await feesInstallmentServices.create(req.body);
                // console.log(feesinstallment);
                // }
                requestResponsehelper.sendResponse(res, serviceResponse);
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// router.post("/data/save", async (req, res, next) => {
//     try {
//         if (ValidationHelper.requestValidationErrors(req, res)) {
//             return;
//         }

//         if (req.body.addmissionId) {
//             const existingDocument = await service.getByAddmissionIdData(
//                 req.body.addmissionId
//             );

//             if (existingDocument) {
//                 req.body.documents = req.body.documents
//                     ? req.body.documents.map((documentData) => {
//                           const documentId =
//                               +Date.now() + Math.floor(Math.random() * 1000);
//                           return {
//                               _id: new mongoose.Types.ObjectId(),
//                               documentId: documentId,
//                               documents: documentData,
//                           };
//                       })
//                     : existingDocument.data?.documents || [];

//                 if (req.body.feesDetails) {
//                     const installmentId = +Date.now();
//                                         req.body.installmentId = installmentId;
//                     const installments = req.body.feesDetails.flatMap((feesDetail) => {
//                         // return feesDetail.installment.map((installment) => {
//                             return {
//                                 feesDetail,
//                                 installmentId:installmentId,
//                                 addmissionId: req.body.addmissionId,
//                                 groupId: req.body.groupId,
//                                 empId: req.body.empId,
//                             };
//                         // });
//                     });

//                     // // Create or update fees installment records
//                     // await Promise.all(installments.map(async (installment) => {
//                     //     const feesinstallment = await feesInstallmentServices.create(installment);
//                     //     console.log(feesinstallment);
//                     // }));

//                     // // // Remove installment details from the request body
//                     // // delete req.body.feesDetails;
//                 }

//                 const serviceResponse = await service.updateUser(
//                     req.body.addmissionId,
//                     req.body
//                 );

//                 requestResponsehelper.sendResponse(res, serviceResponse);
//             } else {
//                 const serviceResponse = await service.create(req.body);

//                 if (req.body.feesDetails) {
//                     const installmentId = +Date.now();
//                     req.body.installmentId = installmentId;
//                     const installments = req.body.feesDetails.flatMap((feesDetail) => {
//                         // return feesDetail.installment.map((installment) => {
//                             return {
//                                 feesDetail,
//                                 installmentId:installmentId,
//                                 addmissionId: req.body.addmissionId,
//                                 groupId: req.body.groupId,
//                                 empId: req.body.empId,
//                             };
//                         // });
//                     });

//                     // Create fees installment records
//                     await Promise.all(installments.map(async (installment) => {
//                         const feesinstallment = await feesInstallmentServices.create(installment);
//                         console.log(feesinstallment);
//                     }));
//                 }

//                 requestResponsehelper.sendResponse(res, serviceResponse);
//             }
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

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
router.post('/bulkupload', upload.single('excelFile'), async (req, res) => {
    try {
    //     const authHeader = req.headers.authorization;
    //   console.log("gggggggggggggggg",authHeader);

    //     if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //         return res.status(401).json({ message: 'Unauthorized - Token is Not Found' });
    //     }

    //     const token = authHeader.split(' ')[1];
    //     const decodedToken = await TokenService.decodeToken(token);

    //     if (!decodedToken || !decodedToken.userId) {
    //         return res.status(401).json({ message: 'Unauthorized - Invalid Token' });
    //     }

    //     const userId = decodedToken.userId;
    //     console.group(userId)

        // if (!req.file) {
        //     return res.status(400).json({ error: 'No file uploaded' });
        // }

        // const excelBuffer = req.file.buffer;
        // const workbook = xlsx.read(excelBuffer, { type: 'buffer' });
        // // console.log("uuuuuuuuuuuuuuuuuuuuuuuuu", workbook.Sheets[workbook.SheetNames[0]]);
        // const sheet = workbook.Sheets[workbook.SheetNames[0]];

        // const excelData = xlsx.utils.sheet_to_json(sheet);
        //  console.log("yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",excelData)
        // if (!excelData || excelData.length < 2) {
        //     return res.status(400).json({ error: 'Invalid Excel format' });
        // }

        // // const headers = excelData[0];
        // const dataRows = excelData
let dataRows=req.body.dataRows
// console.log("ccccccccccccc",dataRows);

        const result = await service.bulkUpload( dataRows);
        
        if (!result) {
            throw new Error(`Smart ID already exists`);
        }
      
        res.json({ success: true, message: "Bulk upload successful" ,data:result});
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});


router.get("/all/getByGroupId/:groupId", async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const criteria = {
            // phoneNumber: req.query.phoneNumber,
            firstName: req.query.firstName,
            phoneNumber: req.query.phoneNumber,
            lastName: req.query.lastName,
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

router.get("/all/getfeesPayment/:groupId", async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const criteria = {
            // phoneNumber: req.query.phoneNumber,
            firstName: req.query.firstName,
            phoneNumber: req.query.phoneNumber,
            lastName: req.query.lastName,
            search: req.query.search,
            addmissionId: req.query.addmissionId,
            empId: req.query.empId
        };

        const serviceResponse = await service.getfeesPayment(
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

router.get('/autocomplete/students', async (req, res) => {
    const firstName = req.query.firstName;
    try {
      const students = await Student.find({ firstName: { $regex: firstName, $options: 'i' } }).limit(10); // Case-insensitive regex search for student names
      const suggestedNames = students.map(student => student.name);
      res.json(suggestedNames);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
module.exports = router;
