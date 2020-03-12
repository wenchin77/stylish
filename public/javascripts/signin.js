/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
// send data with ajax to user.js
function nativeSignIn() {
  email = document.getElementById("email").value;
  password = document.getElementById("password").value;
  if (!email || !password) {
    alert("請填寫信箱和密碼！");
  } else {
    const nativeUser = {
      provider: "native",
      email: email,
      password: password
    };
    console.log(nativeUser);

    // 把登入資料拿去打後端 signin api, 再轉址到 profile.html 顯示用戶資料

    $.ajax({
      url: "/api/v1.0/user/signin",
      type: "post",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify(nativeUser),
      success: function(info) {
        // set cookie
        console.log(info.data);
        document.cookie = `token=${info.data.access_token}`;
        window.location.pathname = "/profile.html";
      },
      error: function(res) {
        alert(res.responseText);
      }
    });
  }
}

function nativeSignUp() {
  name = document.getElementById("name-signup").value;
  email = document.getElementById("email-signup").value;
  password = document.getElementById("password-signup").value;
  if (!name || !email || !password) {
    alert("請填寫名字、信箱和密碼！");
  } else {
    const nativeUser = {
      provider: "native",
      name: name,
      email: email,
      password: password
    };
    console.log(nativeUser);
    $.ajax({
      url: "/api/v1.0/user/signup",
      type: "post",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify(nativeUser),
      success: function(info) {
        // set cookie
        document.cookie = `token=${info.data.access_token}`;
        window.location.pathname = "/profile.html";
      },
      error: function(res) {
        alert(res.responseText);
      }
    });
  }
}

// log in with FB
// https://dotblogs.com.tw/shadow/2019/10/12/114017

// 使用自己客製化的按鈕來登入
function FBLogin() {
  FB.getLoginStatus(function(res) {
    if (res.status === "connected") {
      const userID = res.authResponse.userID;
      const fbToken = res.authResponse.accessToken;
      console.log(
        "用戶已授權您的App，用戶須先revoke撤除App後才能再重新授權你的App"
      );
      console.log(
        `本來就登入 -- 已授權App登入FB 的 userID:${userID}`
      );
      sendTokenToDb(fbToken);
    } else if (res.status === "not_authorized" || res.status === "unknown") {
      // App未授權或用戶登出FB網站才讓用戶執行登入動作
      FB.login(
        function(response) {
          if (response.status === "connected") {
            // user已登入FB
            const userID = response.authResponse.userID;
            const fbToken = response.authResponse.accessToken;
            console.log(
              `not_authorized || unknown >> connected 再登入 -- 已授權App登入FB 的 userID:${userID}`
            );
            sendTokenToDb(fbToken);

          } else {
            // user FB取消授權
            alert("Facebook帳號無法登入");
          }
          // "public_profile"可省略，仍然可以取得name、userID
        },
        {
          scope: "email, public_profile",
          return_scopes: true
        }
      );
    }
  });
}

// Get token
function sendTokenToDb(fbToken) {
  const fbUser = {
    provider: "facebook",
    fb_access_token: fbToken
  };
  // use ajax to send data to user.js
  $.ajax({
    url: "/api/v1.0/user/signin",
    type: "post",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify(fbUser),
    success: function(info) {
      console.log("*******")
      // set cookie
      console.log(info.data);
      document.cookie = `token=${info.data.access_token}`;
      window.location.pathname = "/profile.html";
    },
    error: function(res) {
      alert(res.responseText);
    }
  });
  
}

// 刪除使用者已授權你的FB App，好讓使用者下次重新授權你的FB App
// 參考：https://stackoverflow.com/questions/6634212/remove-the-application-from-a-user-using-graph-api/7741978#7741978
// https://stackoverflow.com/questions/9050190/facebook-api-sdk-revoke-access
function Del_FB_App() {
  FB.getLoginStatus(function(response) {
    // 取得目前user是否登入FB網站
    // debug用
    console.log(response);
    if (response.status === "connected") {
      // 抓userID
      // let userID = response["authResponse"]["userID"];

      FB.api("/me/permissions", "DELETE", function(response) {
        console.log("刪除結果");
        console.log(response); // gives true on app delete success
        // 最後一個參數傳遞true避免cache
        FB.getLoginStatus(function(res) {}, true); // 強制刷新cache避免login status下次誤判
      });
    } else {
      console.log("無法刪除FB App");
    }
  });
}
