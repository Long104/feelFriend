const express = require("express");
const router = express.Router();
const db = require("../db");
const dayjs = require("dayjs");

router.get("/", async (req, res) => {
	let allPosts = [];
	try {
		allPosts = await db
			.select("post.id", "post.title", "post.post_from", "post.createAt")
			.count("comment.id as commentsCount")
			.from("post")
			.leftJoin("comment", "post.id", "comment.postId")
			.groupBy("post.id")
			.orderBy("post.id", "desc");
		allPosts = allPosts.map((post) => {
			const createAtText = dayjs(post.createAt).format("D MMM YYYY - HH:mm");
			return { ...post, createAtText };
		});
	} catch (error) {
		console.error(error);
	}
	res.render("home", { allPosts });
});

module.exports = router;
