// AJAX: get data from json and send to frontend

const xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
  if (xhr.readyState === 4 && xhr.status === 200) {
    const products = JSON.parse(xhr.responseText);

    // item div (w/ link to product page)
    for (let i=0; i<products.data.length; i+=1) {
      // 生出一個裝一個商品的圖片、顏色、名稱、價格的容器，裡面有連結導商品頁
      const itemdiv = document.createElement('div');

      // image
      const image = document.createElement('img');
      image.src = products.data[i].main_image;
      image.className = 'main_image';
      itemdiv.appendChild(image);

      // color
      const colors = document.createElement('div');
      for (let j=0; j<products.data[i].colors.length; j+=1) {
        const color = document.createElement('div');
        // 有幾個顏色再顯示幾個顏色
        if (!products.data[i].colors[j].code) {
          break;
        } else {
          color.style = `background-color: #${products.data[i].colors[j].code};
                width: 20px;
                height: 20px;
                margin-right: 10px;
                display: inline-block;
                vertical-align: middle;
                box-shadow: 0px 0px 1px #bbbbbb;`;
          colors.appendChild(color);
        };
      };
      itemdiv.appendChild(colors);

      // title
      const title = document.createElement('p');
      const titleText = document.createTextNode(`${products.data[i].title}`);
      title.appendChild(titleText);
      itemdiv.appendChild(title);

      // price
      const price = document.createElement('p');
      // eslint-disable-next-line max-len
      const priceText = document.createTextNode(`TWD. ${products.data[i].price}`);
      price.appendChild(priceText);
      itemdiv.appendChild(price);

      // 把裝一個商品的圖片、顏色、名稱、價格的容器丟到id = 'product' 的 div
      document.getElementById('products').appendChild(itemdiv);

      // product link
      const a = document.createElement('a');
      a.href = `../product.html?id=${products.data[i].id}`;
      a.className = 'item';
      a.appendChild(itemdiv);
      document.getElementById('products').appendChild(a);
    }

    console.log(products.data);
  }
};

xhr.open('GET', '../api/v1.0/products/all');
xhr.send();

