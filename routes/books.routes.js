const express = require("express");
const router = express.Router();
const { checkSchema } = require("express-validator");
const service = require("../services/books.services");
const requestResponsehelper = require("@baapcompany/core-api/helpers/requestResponse.helper");
const ValidationHelper = require("@baapcompany/core-api/helpers/validation.helper");
const booksModel = require("../schema/books.schema");
const shelfModel=require('../schema/shelf.schema');
const deparmentModel=require("../schema/department.schema")

router.post(
    "/",
    checkSchema(require("../dto/books.dto")),
    async (req, res, next) => {
        if (ValidationHelper.requestValidationErrors(req, res)) {
            return;
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
//         const { name, publisher, department, shelf, search, page, pageSize } = req.query;

//         let bookData = await service.getAllDataByGroupId(groupId, name, publisher, department, shelf, search, page, pageSize);
//         res.json(bookData);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Internal Server Error" });
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
            department: req.query.department,
            publisher: req.query.publisher,
            price: req.query.price,
            status: req.query.status,
        };
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10; // Default limit to 10 if not provided
        const skip = (page - 1) * limit;

        const searchFilter = service.getAllDataByGroupId(groupId, criteria, skip, limit);

        // Use the search filter to fetch data count from the database
        const totalCount = await booksModel.countDocuments(searchFilter);
        const books = await booksModel.find(searchFilter)
            .skip(skip)
            .limit(limit);

        // Manually populate shelf and department information
        const populatedBooks = await Promise.all(
            books.map(async (book) => {
                const shelf = await shelfModel.findOne({ shelfId: book.shelfId });
                const department = await deparmentModel.findOne({ departmentId: book.departmentId });
                return { ...book._doc, shelf, department };
            })
        );

        // Return all data related to the matched documents along with total count
        res.json({
            status: "Success",
            data: {
                items: populatedBooks,
                totalItemsCount: totalCount,
            },
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
        res.json({ totalAvailableBooks: totalCount });
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
            totalCount +=parseInt(book.totalCopies)|| 0;
        }
        res.json({ total: totalCount });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get('/book-details/:groupId', async (req, res) => {
      const groupId=req.params.groupId
      const criteria = {
        search: req.query.search,
      }
      const result = await service.getBookDetails(groupId,criteria);
      requestResponsehelper.sendResponse(res, result);
  });
  

module.exports = router;
