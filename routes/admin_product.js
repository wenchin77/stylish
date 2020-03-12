const express = require("express");
const router = express.Router();
const db = require("../db.js");
const multer = require("multer");
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');

const s3Config = new aws.S3({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

const upload = multer({
  storage: multerS3({
      s3: s3Config,
      bucket: process.env.AWS_BUCKET,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: function (req, file, cb) {
          console.log(file);
          cb(null, Date.now()+file.originalname); //use Date.now() for unique file keys
      }
  })
});

require('dotenv').config()




// post
router.post("/", upload.array("images", 3), (req, res) => {
  const productData = {
    id: null,
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    texture: req.body.texture,
    wash: req.body.wash,
    place: req.body.place,
    note: req.body.note,
    story: req.body.story,
    sizes: req.body.sizes,
    main_image: req.files[0].key,
    image_2: req.files[1].key,
    image_3: req.files[2].key,
    category: req.body.category,
    keyword: req.body.keyword
  }

  const sqlProduct = ('INSERT INTO product SET ?');
  let pid;
  db.query(sqlProduct, productData, function(err, result) {
    if (err) throw err;
    pid = result.insertId; // pid will be used in color & variant tables later

    const colorData = [
      [req.body.colorname, req.body.colorcode, pid],
      [req.body.colorname2, req.body.colorcode2, pid],
      [req.body.colorname3, req.body.colorcode3, pid],
    ]
    
    const sqlColor = ('INSERT INTO color_object (name, code, id) VALUES ?');
    db.query(sqlColor, [colorData], function(err, res) {
      if (err) throw err;
    });
  
    const vrData = [
      [req.body.vrcolorcode, req.body.vrsize, req.body.vrstock, pid],
      [req.body.vrcolorcode2, req.body.vrsize2, req.body.vrstock2, pid],
      [req.body.vrcolorcode3, req.body.vrsize3, req.body.vrstock3, pid],
    ]
  
    const sqlVariant = ('INSERT INTO variant_object (color_code, size, stock, id) VALUES ?');
    db.query(sqlVariant, [vrData], function(err, res) {
      if (err) throw err;
    });
  
    res.send({
      productData,
      colorData,
      vrData
    });
  });

});

function split(url) {
  return url.split("/")[1] + "/" + url.split("/")[2];
}

module.exports = router;
