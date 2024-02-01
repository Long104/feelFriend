const express = require("express");
const hbs = require("hbs");
require("dotenv").config();
const app = express();
const port = process.env.APP_PORT ?? process.env.Port;
console.log(process.env);
const generalRouter = require("./routers/general");
const postRouter = require("./routers/posts");
app.use(express.urlencoded({ extended: "true" }));
app.set("view engine", "hbs");
app.use("/static", express.static("static"));
hbs.registerPartials(__dirname + "/views/partials");

app.use("/", generalRouter);
app.use("/p", postRouter);

app.listen(port, () => {
	console.log(`come to http://localhost:${port}`);
});
