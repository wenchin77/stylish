// 檢查有沒有 token in cookie，沒有的話轉到 signin.html 請用戶登入
const user_token = getCookie("token");
console.log(user_token);
if (!user_token) {
  alert("請先登入");
  window.location.pathname = "/signin.html";
} else {
  showProfile();
}

function getCookie(name) {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
  if (parts.length == 2)
    return parts
      .pop()
      .split(";")
      .shift();
}

// // use axios to send http request
// const axios = require('axios');

// const config = {
//   url: '../api/v1.0/user/profile',
//   // method: 'get',
//   headers: {'Authorization': `Bearer ${user_token}`},
//   // `data` is the response that was provided by the server
//   data: {},
// };

// const getProfile = axios.get('../api/v1.0/user/profile', config)
// .then((response) => {
//   console.log(response.data);
// })
// // .catch ((error) => {
// //   console.log(error);
// // });

// 檢查 token in cookie 有沒有在 db（期限內有註冊／登入），有的話顯示 profile，沒有的話請用戶重新登入


function showProfile() {
  console.log(00000);
  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function() {
    // status code 後端 api 有設定，如無 token 或過期就 xhr.status == 403
    
    if (xhr.readyState === 4 && xhr.status === 200) {
      // db 找到 token
      const userProfile = JSON.parse(xhr.responseText);
      console.log(userProfile);

      alert("登入成功！");

      const userDiv = document.createElement("div");

      appendUserDetail("User Profile", "", userDiv);
      appendUserDetail("ID", userProfile.data.id, userDiv);
      appendUserDetail("Provider", userProfile.data.provider, userDiv);
      appendUserDetail("Name", userProfile.data.name, userDiv);
      appendUserDetail("Email", userProfile.data.email, userDiv);

      if (userProfile.data.picture) {
        // for fb user only
        appendUserDetail("user-picture", userProfile.data.picture, userDiv);
      }
      document.getElementById("profile-wrapper").appendChild(userDiv);

    } else if (xhr.readyState === 4) {
      // api errors
      alert(xhr.responseText);
      console.log(xhr.responseText.status);
      window.location.pathname = "/signin.html";
    }
  };
  xhr.open("GET", "../../api/v1.0/user/profile");
  // 把 token 放進 req headers 讓後端 profile api 讀取
  xhr.setRequestHeader("Authorization", `Bearer ${user_token}`);
  xhr.send();
}


function appendUserDetail(item, data, parent) {
  const node = document.createElement("div");
  const text = document.createTextNode(`${item}: ${data}`);
  node.appendChild(text);
  parent.appendChild(node);
};