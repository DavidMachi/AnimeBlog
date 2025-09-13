const express = require("express");
const blogController = require("../controllers/blogController");

const router = express.Router();

// router.get("/create", blogController.blog_create_get);
// router.get("/", blogController.blog_index);
// router.post("/", blogController.blog_create_post);
router.delete("/:id", blogController.blog_delete);
router.post("/:id/add-comment", blogController.blog_add_comment);
router.post("/:id/add-vote", blogController.blog_add_vote);
router.get("/:id", blogController.blog_details);

module.exports = router;
