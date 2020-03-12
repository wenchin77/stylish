const express = require("express");
const router = express.Router();
const db = require("../../db.js");
const util = require("util");
const query = util.promisify(db.query).bind(db);
const cacheFunc = require("../../middleware/cache.js");

router.get("/", function(req, res) {
  res.render("index", { title: "Marketing Index Page" });
});

router.get("/campaigns", async (req, res) => {
  try {
    const cacheResult = await cacheFunc.getCache('data');
    console.log(cacheResult);
    if (cacheResult !== false) {
      res.status(200).send(cacheResult);
      return;
    } else {
      // GET PRODUCT DATA TO PUT IN JSON
      console.log("Getting data in db...");
      const campaignList = await query(`SELECT * FROM campaign`);

      // FORMATTING JSON
      let dataInJson = { data: campaignList };
      console.log(dataInJson);

      // Store object in Redis
      cacheFunc.setCache('data',dataInJson);

      // sending out final json
      res.status(200).send(JSON.stringify(dataInJson));
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Oh no there's an error!");
  }
});

module.exports = router;
