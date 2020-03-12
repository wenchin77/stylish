const express = require("express");
const router = express.Router();
const db = require("../../db.js");
const util = require("util");
const query = util.promisify(db.query).bind(db);
const cacheFunc = require("../../middleware/cache.js");
const url = "http://d252bn7vwimrh.cloudfront.net/";

router.get("/", function(req, res) {
  res.render("index", { title: "Product Index Page" });
});


router.get("/:category", async (req, res) => {
  try {
    // CATEGORY
    let param = req.params.category;
    let keyword = req.query.keyword;
    let id = req.query.id;

    // PAGING
    // parseInt attempts to parse the value to an integer
    let page = parseInt(req.query.paging);
    let limit = 6;
    if (isNaN(page) || page < 0) {
      page = 0;
    }
    let offset = (page + 1) * limit - limit;

    // GET PRODUCT DATA TO PUT IN JSON
    if (param == "all") {
      productList = await query(
        `SELECT * FROM product LIMIT ${limit} OFFSET ${offset}`
      );
      colorList = await query("SELECT * FROM color_object");
      vrList = await query("SELECT * FROM variant_object");
      productCount = await query("SELECT COUNT(*) productNo FROM product");
    } else if (param == "search") {
      productList = await query(
        `SELECT * FROM product WHERE keyword = '${keyword}' LIMIT ${limit} OFFSET ${offset}`
      );
      colorList = await query("SELECT * FROM color_object");
      vrList = await query("SELECT * FROM variant_object");
      productCount = await query(
        `SELECT COUNT(*) productNo FROM product WHERE keyword = '${keyword}'`
      );
    } else if (param == "details") {
      // Check if there's data in cache
      const cacheResult = await cacheFunc.getCache(id);
      if (cacheResult !== false) {
        res.status(200).send(cacheResult);
        return;
      } else {
        // Get data from db
        console.log("Getting data in db...");
        productList = await query(
          `SELECT * FROM product WHERE id = '${id}' LIMIT ${limit} OFFSET ${offset}`
        );
        colorList = await query("SELECT * FROM color_object");
        vrList = await query("SELECT * FROM variant_object");
      }
    } else {
      // category = men, women, accessories
      productList = await query(
        `SELECT * FROM product WHERE category = '${param}' LIMIT ${limit} OFFSET ${offset}`
      );
      colorList = await query("SELECT * FROM color_object");
      vrList = await query("SELECT * FROM variant_object");
      productCount = await query(
        `SELECT COUNT(*) productNo FROM product WHERE category = '${param}'`
      );
    }

    // COLORS: Inserting the corresponding colorList array (w/ nested product JSON by looping on productList)
    for (let i = 0; i < productList.length; i++) {
      let colorSubject = [];
      for (let j = 0; j < colorList.length; j++) {
        if (productList[i].id == colorList[j].id) {
          colorSubject.push({
            name: colorList[j].name,
            code: colorList[j].code
          });
        }
      }
      productList[i].colors = colorSubject;
    }

    // SIZES: Converting from a string to an array using array.split
    for (let i = 0; i < productList.length; i++) {
      let sizeArrayStr = JSON.stringify(productList[i].sizes);
      console.log(typeof sizeArrayStr);
      let sizeArray = sizeArrayStr.split(", ");
      productList[i].sizes = sizeArray;
    }

    // VARIANTS: Inserting the corresponding vrList array (w/ nested product JSON by looping on productList)
    for (let i = 0; i < productList.length; i++) {
      let vrSubject = [];
      for (let j = 0; j < vrList.length; j++) {
        if (productList[i].id == vrList[j].id) {
          vrSubject.push({
            color_code: vrList[j].color_code,
            size: vrList[j].size,
            stock: vrList[j].stock
          });
        }
      }
      productList[i].variants = vrSubject;
    }

    // IMAGES: Putting together all 3 images using elements.join
    for (let i = 0; i < productList.length; i++) {
      let otherImageSubject = [];
      otherImageSubject.push(url+productList[i].image_2);
      otherImageSubject.push(url+productList[i].image_3);
      productList[i].main_image = url+productList[i].main_image;
      productList[i].images = otherImageSubject;
    }

    // PAGING & FORMATTING JSON
    if (param == "details") {
      dataInJson = { data: productList[0] };
      // Store object in cache
      cacheFunc.setCache(id, dataInJson);
      res.status(200).send(dataInJson);
    } else {
      let nextPage = page + 1;
      let lastPage = Math.ceil(productCount[0].productNo / limit);
      dataInJson = { data: productList };
      if (page < lastPage - 1) {
        dataInJson.next_paging = nextPage;
      }
      // sending out final json
      res.status(200).send(JSON.stringify(dataInJson));
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Oh no there's an error!");
  }
});

module.exports = router;
