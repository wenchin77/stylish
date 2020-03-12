const express = require("express");
const router = express.Router();
const User = require('../../../model/user.js');
const Util = require('../../../util/util.js');

router.get("/", async (req, res) => {
  try {
    const bearerToken = req.headers.authorization;
    console.log(bearerToken);
    const bearerTokenNum = bearerToken.split(" ")[1];
    const tokenCheck = await User.getUserByToken(bearerTokenNum);

    // check if there's a token
    if (!bearerToken) {
      res.status(403).send("尚未登入");
      return;
    }
    if (!tokenCheck) {
      // check if the token exists in db
      res.status(403).send("認證失敗，請重新登入");
      return;
    }

    // check if the token's not expired
    const now = new Date(Util.onTime());

    const userLastTokenTime = tokenCheck.last_signin_date;
    const timeDiff = (now - userLastTokenTime) / 1000;
    if (timeDiff > 60) {
      res.status(403).send("連現階段已過期，請重新登入");
      return;
    }
    const userDataRes = {
      id: tokenCheck.userid,
      provider: tokenCheck.provider,
      name: tokenCheck.name,
      email: tokenCheck.email,
      picture: tokenCheck.picture
    };

    res.json({
      data: userDataRes
    });
  } catch (err) {
    res.status(500).send("伺服器錯誤，請稍後再試");
    console.log(err);
  }
});


module.exports = router;
