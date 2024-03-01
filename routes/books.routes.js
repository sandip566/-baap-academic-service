const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/books.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const booksModel = require("../schema/books.schema");
const shelfModel = require("../schema/shelf.schema");
const deparmentModel = require("../schema/department.schema");

router.post(
    "/",
    checkSchema(require("../dto/books.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
        }
        if (req.body.totalCopies !== undefined) {
            req.body.availableCount = req.body.totalCopies;
        }
        const bookId = +Date.now();
        req.body.bookId = bookId;
        const serviceResponse = await service.create(req.body);
        requestResponsehelper.sendResponse(res, serviceResponse);
    }
);

router.get("/all", async (req, res) => {
    const pagination = {
        pageNumber: req.query.pageNumber || 1,
        pageSize: 10,
    };
    const { pageNumber, pageSize, ...query } = req.query;
    const serviceResponse = await service.getAllByCriteria(query, pagination);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.delete("/:id", async (req, res) => {
    const serviceResponse = await service.deleteById(req.params.id);
    requestResponsehelper.sendResponse(res, serviceResponse);
});

router.put("/:id", async (req, res) => {
    const serviceResponse = await service.updateById(req.params.id, req.body);
    requestResponsehelper.sendResponse(res, serviceResponse);
});
// router.get("/all/getByGroupId/:groupId", async (req, res) => {
//     try {
//         const groupId = req.params.groupId;
//         const criteria = {
//             name: req.query.name,
//             author: req.query.author,
//             totalCount: req.query.totalCount,
//             availableCount: req.query.availableCount,
//             search: req.query.search,
//             shelfId: req.query.shelfId,
//             departmentId: req.query.departmentId,
//             publisher: req.query.publisher,
//             price: req.query.price,
//             status: req.query.status,
//             departmentName:req.query.departmentName
//         };
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10; 
//         const skip = (page - 1) * limit;

//         const searchFilter =await service.getAllDataByGroupId(groupId, criteria, skip, limit);
//         const totalCount = await booksModel.countDocuments(searchFilter);
//         const books = await booksModel.find(searchFilter)
//             .skip(skip)
//             .limit(limit);
//         const populatedBooks = await Promise.all(
//             books.map(async (book) => {
//                 const shelf = await shelfModel.findOne({ shelfId: book.shelfId });
//                 const department = await deparmentModel.findOne({ departmentId: book.departmentId });
//                 return { ...book._doc, shelf, department };
//             })
//         );
//         res.json({
//             status: "Success",
//             data: {
//                 items: populatedBooks,
//             },
//             totalCount:totalCount
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).send("Server Error");
//     }
// });




router.get("/all/getByGroupId/:groupId", async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const criteria = {
            name: req.query.name,
            author: req.query.author,
            totalCount: req.query.totalCount,
            availableCount: req.query.availableCount,
            search: req.query.search,
            shelfId: req.query.shelfId,
            departmentId: req.query.departmentId,
            publisher: req.query.publisher,
            price: req.query.price,
            status: req.query.status,
            shelfName: req.query.shelfName,
            departmentName: req.query.departmentName
        };

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const departmentMap = await service.getDepartmentMap();


        const { searchFilter} = await service.getAllDataByGroupId(groupId, criteria, skip, limit,departmentMap);
        const totalCount = await booksModel.countDocuments(searchFilter);
        const books = await booksModel.find(searchFilter)
            .skip(skip)
            .limit(limit)
            .exec();

        const populatedBooks = await Promise.all(
            books.map(async (book) => {
                const shelf = await shelfModel.findOne({ shelfId: book.shelfId });
                const department = await deparmentModel.findOne({ departmentId: book.departmentId });
                return { ...book._doc, shelf, department };
            })
        );

        res.json({
            status: "Success",
            data: {
                items: populatedBooks,
                totalCount: totalCount
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});









router.delete("/groupId/:groupId/bookId/:bookId", async (req, res) => {
    try {
        const bookId = req.params.bookId;
        const groupId = req.params.groupId;
        const bookData = await service.deleteBookById({
            bookId: bookId,
            groupId: groupId,
        });
        if (!bookData) {
            res.status(404).json({
                error: "book data not found to delete",
            });
        } else {
            res.status(201).json(bookData);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.put("/groupId/:groupId/bookId/:bookId", async (req, res) => {
    try {
        const bookId = req.params.bookId;
        const groupId = req.params.groupId;
        const newData = req.body;
        const updatebook = await service.updateBookById(
            bookId,
            groupId,
            newData
        );
        if (!updatebook) {
            res.status(404).json({
                error: "book data not found to update",
            });
        } else {
            res.status(200).json({
                updatebook,
                message: "data update successfully",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/totalAvailableBooks", async (req, res) => {
    try {
        const totalCount = await service.getTotalAvailableBooks();
        res.json({ totalAvailableBooks: totalCount});
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/totalBooks", async (req, res) => {
    try {
        const books = await booksModel.find();
        let totalCount = 0;
        for (const book of books) {
            totalCount += parseInt(book.totalCopies) || 0;
        }
        res.json({ total: totalCount });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/book-details/:groupId", async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const criteria = {
            search: req.query.search,
        };
        const departmentMap = await service.getDepartmentMap();
        const { searchFilter } = await service.getBookDetails(
            groupId,
            criteria,
            departmentMap
        );
        //const totalCount = await booksModel.countDocuments(searchFilter);
        const books = await booksModel.find(searchFilter);

        const populatedBooks = await Promise.all(
            books.map(async (book) => {
                const shelf = await shelfModel.findOne({
                    shelfId: book.shelfId,
                });
                const department = await deparmentModel.findOne({
                    departmentId: book.departmentId,
                });
                return { ...book._doc, shelf, department };
            })
        );
        res.json({
            status: "Success",
            data: {
                items: populatedBooks,
                //totalCount: totalCount
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
