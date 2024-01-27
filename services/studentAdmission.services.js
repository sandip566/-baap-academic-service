const ServiceResponse = require("@baapcompany/core-api/services/serviceResponse");
const studentAdmissionModel = require("../schema/studentAdmission.schema");
const BaseService = require("@baapcompany/core-api/services/base.service");
const feesInstallmentServices = require("./feesInstallment.services");
const StudentsAdmissionModel = require("../schema/studentAdmission.schema");

class StudentsAdmmisionService extends BaseService {
    constructor(dbModel, entityName) {
        super(dbModel, entityName);
    }

    async updateStudentsAddmisionById(studentAdmissionId, groupId, newData) {
        try {
            const updatedData = await studentAdmissionModel.findOneAndUpdate(
                { studentAdmissionId: studentAdmissionId, groupId: groupId },
                newData,
                { new: true }
            );
            return updatedData;
        } catch (error) {
            throw error;
        }
    }
    async updateUser(addmissionId, data) {
        try {
            const resp = await studentAdmissionModel.findOneAndUpdate(
                { addmissionId: addmissionId },

                data,
                { upsert: true, new: true }
            );

            return new ServiceResponse({
                data: resp,
            });
        } catch (error) {
            return new ServiceResponse({
                isError: true,
                message: error.message,
            });
        }
    }
    async deleteByStudentsAddmisionId(studentAdmissionId, groupId) {
        try {
            return await studentAdmissionModel.deleteOne(
                studentAdmissionId,
                groupId
            );
        } catch (error) {
            throw error;
        }
    }
//     async addInstallment(groupId, addmissionId, memberObject) {
//         const newMember = await feesInstallmentServices.create(memberObject);
// console.log(newMember);
//         const updatedGroup = await studentAdmissionModel
//             .findOneAndUpdate(
//                 // groupId,
//                 addmissionId,
//                 { $push: { feesDetails: newMember.data._id } },
//                 { new: true }
//             )
//             .lean();

//         const response = {
//             status: "Success",
//             data: updatedGroup,
//             message: "installment updated successfully",
//         };

//         delete response.data; // Remove the memberObject from the response

//         return response;
//     }
    async getByaddmissionId(addmissionId) {
        return this.execute(() => {
            return this.model.findOne({ addmissionId: addmissionId });
        });
    }
    async deleteCompanyDetails(addmissionId, installmentId) {
        try {
            const deletedMember = await feesInstallmentServices.deleteStudentById(installmentId);
    
            console.log("deletedMember", deletedMember.data.installmentId);
    
            if (deletedMember.isError) {
                return deletedMember;
            }
    
            const updatedAdmission = await StudentsAdmissionModel.findOneAndUpdate(
                { addmissionId: addmissionId },
                {
                    $pull: { feesDetails: { installmentId: deletedMember.data.installmentId } },
                },
                { new: true }
            ).lean();
    
            return updatedAdmission;
        } catch (error) {
            console.error(error);
            // Handle the error accordingly
            return { isError: true, message: 'An error occurred during the deletion process' };
        }
    }
    
    getAllDataByGroupId(groupId, criteria) {
        const query = {
            groupId: groupId,
        };
        if (criteria.studentAdmissionId)
            query.studentAdmissionId = criteria.studentAdmissionId;
        return this.preparePaginationAndReturnData(query, criteria);
    }
}
module.exports = new StudentsAdmmisionService(
    studentAdmissionModel,
    "studentAdmission"
);
