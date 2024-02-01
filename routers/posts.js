const express = require("express");
const router = express.Router();
const db = require("../db");
const dayjs = require("dayjs");

async function getPostAndComments(postId) {
	let onePost = null;
	let postComments = [];
	try {
		//get one post
		const somePosts = await db.select("*").from("post").where("id", +postId);
		onePost = somePosts[0];
		onePost.createAtText = dayjs
			.tz(onePost.createAt)
			.format("D MMM YYYY - HH-mm");

		postComments = await db
			.select("*")
			.from("comment")
			.where("postId", +postId);
		postComments = postComments.map((comment) => {
			const createAtText = dayjs.tz(comment.createAt).format("D MM YYYY HH-mm");
			return { ...comment, createAtText };
		});
	} catch (error) {
		console.error(error);
	}
	const customTitle = !!onePost
		? `${onePost.title} | `
		: "can't find this post";
	return { onePost, postComments, customTitle };
}

router.post("/new", async (req, res) => {
	const { title, content, post_from, accepted } = req.body ?? {};
	try {
		// validation
		if (!title || !content || !post_from) {
			throw new Error("no text");
		} else if (accepted !== "on") {
			throw new Error("no accepted");
		}
		//create post
		await db
			.insert({ title, content, post_from, createAt: new Date() })
			.into("post");
	} catch (error) {
		console.error(error);
		let errorMessage = "something is wrong";
		if (error.message === "no text") {
			errorMessage = "write some text bro";
		} else if (error.message === "no accepted") {
			errorMessage = "check the check box bro";
		}
		return res.render("postNew", {
			errorMessage,
			values: { title, content, post_from },
		});
	}
	res.redirect("/p/new/done");
});

router.get("/new/done", (req, res) => {
	res.render("postNewDone");
});

router.get("/new", (req, res) => {
	// res.send(`create new form`);
	res.render("postNew");
});

router.get("/:postId", async (req, res) => {
	const { postId } = req.params;
	const postData = await getPostAndComments(postId);
	res.render("postId", postData);
});

router.post("/:postId/comment", async (req, res) => {
	const { postId } = req.params;
	const { content, post_from, accepted } = req.body ?? {};
	try {
		if (!content || !post_from) {
			throw new Error("no text");
		} else if (accepted !== "on") {
			throw new Error("no accepted");
		}
		await db
			.insert({ content, post_from, createAt: new Date(), postId: +postId })
			.into("comment");
	} catch (error) {
		console.error(error);
		let errorMessage = "something is wrong";
		if (error.message === "no text") {
			errorMessage = "write some text bro";
		} else if (error.message === "no accepted") {
			errorMessage = "check the check box bro";
		}
		const postData = await getPostAndComments(postId);
		return res.render("postId", {
			...postData,
			errorMessage,
			values: { content, post_from },
		});
	}
	res.redirect(`/p/${postId}`);
});

module.exports = router;
