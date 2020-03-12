const express = require("express");
const router = express.Router();
const request = require("request");
const User = require('../../../model/user.js');
const Util = require('../../../util/util.js');


router.post('/', async (req, res) => {

  const pw = req.body.password ? Util.encryptData(req.body.password) : '';
  
  userReqData = {
    provider: req.body.provider,
    name: req.body.name,
    email: req.body.email,
    password: pw,
    picture: req.body.picture,
    fb_access_token: req.body.fb_access_token,
    datetime_now: Util.onTime()
  };

  // hash token: generates every time a signup / signin happens
  const hash = Util.encryptData(userReqData.email + userReqData.datetime_now);

  let result;
  // check user based on the provider
  if (userReqData.provider === 'native') {
    result = await nativeSignIn(hash, userReqData);
  } else { // facebook
    result = await fbSignIn(hash, userReqData);
  }

  // get result from db and send out response
  if (result.data) {
    res.send(result)
  } else {
    res.status(500).end(result)
  }
});




async function nativeSignIn(accessToken, userReqData){
  // db query 放 model
  // const result = UserModel.getUser(userReqData);

  // check if email exists in db
  nativeUser = await User.getUserByEmail(userReqData.email);
  console.log(nativeUser);
  
  if (nativeUser) {
    // verify email & password
    if (nativeUser.password == userReqData.password) {
      await User.updateUserByEmail(accessToken, userReqData.datetime_now, userReqData.email);

      const nativeUserData = await User.getUserByEmail(userReqData.email);

      const resObject = userResObject(
        accessToken,
        nativeUserData.userid,
        userReqData.provider,
        nativeUserData.name,
        userReqData.email,
        userReqData.picture
      );
      return ({
        data: resObject
      });
    }
    return ("Wrong email / password.");
  } else {
    return ("You have not signed up yet.");
  }
}

async function fbSignIn(accessToken, userReqData){
  // Get user name, email and picture via fb graph api with request module
  const fbReqUrl = `https://graph.facebook.com/v5.0/me?fields=name,picture,email&access_token=${userReqData.fb_access_token}`;
  const userDataFromFb = await fbReqPromise(fbReqUrl);
  console.log(userDataFromFb);

  if (userDataFromFb.error) {
    // request 途中出問題，FB 回傳 error json
    res.send("Error loading FB user data");
    return;
  }

  const fbname = userDataFromFb.name;
  const fbemail = userDataFromFb.email;
  const fbpic = userDataFromFb.picture.data.url;

  // check if fb user exists in db
  const checkFbUser = await User.getUserByEmail(fbemail);

  let fbUserId;

  if (!checkFbUser) {
    // user doesn't exist in db
    console.log("FB user not found. Adding it to db...");

    const fbUserData = {
      userid: null,
      provider: userReqData.provider,
      name: fbname,
      email: fbemail,
      picture: fbpic,
      password: null,
      access_token: accessToken,
      create_date: userReqData.datetime_now,
      last_signin_date: userReqData.datetime_now,
      fb_access_token: userReqData.fb_access_token
    };
    const addFbUser = await User.addUser(fbUserData);
    fbUserId = addFbUser.insertID;

  } else {
    // user exists in db
    console.log("User exists in db... Updating info...");
    await User.updateUserByEmail(accessToken, userReqData.datetime_now, fbemail);
    fbUserId = checkFbUser.userid;
  };

  // const fbUser = await User.getUserByEmail(fbemail);


  const resObject = userResObject(
    accessToken,
    fbUserId,
    userReqData.provider,
    fbname,
    fbemail,
    fbpic
  );

  console.log(resObject);

  return ({
    data: resObject
  });
};




function fbReqPromise(url) {
  const promise = new Promise((resolve, reject) => {
    request(url, (err, res, body) => {
      if (err) throw err;
      resolve(JSON.parse(body));
    });
  });
  return promise;
};




function userResObject(hash, id, provider, name, email, pic) {
  return {
    access_token: hash,
    access_expired: 60,
    user: {
      id: id,
      provider: provider,
      name: name,
      email: email,
      picture: pic
    }
  };
}

module.exports = router;
