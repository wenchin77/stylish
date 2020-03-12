const express = require("express");
const router = express.Router();
const db = require("../db.js");
const multer = require("multer");
const upload = multer({ dest: "public/uploads/" });
const cacheFunc = require("../middleware/cache.js");

// after http://localhost:3000/admin/campaign.html
router.post("/", upload.single("campaignimage"), async (req, res) => {
  const data = {
    campaign_id: null, 
    product_id: req.body.pid,
    picture: split(req.file.path),
    story: req.body.story
  }

  const sqlCampaign = ('INSERT INTO campaign SET ?');

  await db.query(sqlCampaign, data, function(err, result) {
    if (err) throw err;
    console.log('Adding campaign to db...');
    res.send(data);
  });

  await cacheFunc.clearCache();
});


function split(url) {
  return url.split("/")[1] + "/" + url.split("/")[2];
}

module.exports = router;
