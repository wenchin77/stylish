const express = require("express");
const router = express.Router();
const User = require("../../../model/user.js");
const Util = require("../../../util/util.js");

let userReqData;

router.post("/", async (req, res) => {
  try {
    userReqData = {
      provider: req.body.provider,
      name: req.body.name,
      email: req.body.email,
      password: Util.encryptData(req.body.password),
      picture: req.body.picture,
      fb_access_token: req.body.fb_access_token,
      datetime_now: Util.onTime()
    };
    console.log(userReqData);

    // hash token: generates every time a signup / signin happens
    const hash = Util.encryptData(userReqData.email + userReqData.datetime_now);

    // check if email exists in db
    const userData = await User.getUserByEmail(userReqData.email);

    if (userData) {
      res.send("You signed up before.");
      return;
    }

    const signupUserData = {
      userid: null,
      provider: userReqData.provider,
      name: userReqData.name,
      email: userReqData.email,
      picture: null,
      password: userReqData.password,
      access_token: hash,
      create_date: userReqData.datetime_now,
      last_signin_date: userReqData.datetime_now,
      fb_access_token: null
    };

    const addNativeUser = await User.addUser(signupUserData);

    console.log(userData);
    const userDataOutput = {
      id: addNativeUser.insertId,
      provider: userReqData.provider,
      name: userReqData.name,
      email: userReqData.email,
      picture: userReqData.picture
    };
    const finalJson = {
      access_token: hash,
      access_expired: 60,
      user: userDataOutput
    };
    res.json({
      data: finalJson
    });

  } catch (err) {
    res.send("Oh no there's an error!");
    console.log(err);
  }
});

module.exports = router;
