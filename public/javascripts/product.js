/* eslint-disable camelcase */
// AJAX: get each product's data from json and send to frontend

// parse the url to get the param as product id
const urlParams = new URLSearchParams(window.location.search);
const pid = urlParams.get('id');

const xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
  if (xhr.readyState === 4 && xhr.status === 200) {
    const product = JSON.parse(xhr.responseText);

    // Pending: verify if product exists
    if (!product || !product.data) {
      document.getElementById('card').innerHTML = '<p>查無此商品</p>';
      return;
    }

    // left --- image
    const main_image = document.createElement('img');
    main_image.src = product.data.main_image;
    document.getElementById('main-left').appendChild(main_image);

    // right --- other product details
    const item_detail = document.createElement('div');

    function appendProductDetail(className, data) {
      const node = document.createElement('div');
      node.className = className;
      const text = document.createTextNode(data);
      node.appendChild(text);
      item_detail.appendChild(node);
    }

    // title
    appendProductDetail('title', product.data.title);

    // id
    const id = document.createElement('div');
    id.className = 'pid';
    const idText = document.createTextNode(`${pid}`);
    id.appendChild(idText);
    item_detail.appendChild(id);

    // price
    appendProductDetail('price', `TWD. ${product.data.price}`);

    // color
    const colors = document.createElement('div');
    colors.className = 'colors';
    const colorsText = document.createTextNode('顏色 | ');
    colors.appendChild(colorsText);
    for (let j=0; j<product.data.colors.length; j+=1) {
      const color = document.createElement('div');
      // 有幾個顏色再顯示幾個顏色
      if (!product.data.colors[j].code) {
        break;
      } else {
        color.style = `background-color: #${product.data.colors[j].code};
                width: 30px;
                height: 30px;
                border: 4px solid #ffffff;
                cursor: pointer;
                display: inline-block;
                vertical-align: middle;
                margin-right: 10px;
                box-shadow: 0px 0px 1px #bbbbbb;`;
        colors.appendChild(color);
      };
    };
    item_detail.appendChild(colors);

    // size
    const sizes = document.createElement('div');
    sizes.className = 'sizes';
    const sizesText = document.createTextNode('尺寸 | ');
    sizes.appendChild(sizesText);
    for (let j=0; j<product.data.colors.length; j+=1) {
      const size = document.createElement('div');
      size.className = 'size';
      // 有幾個顏色再顯示幾個顏色
      if (!product.data.sizes[j]) {
        break;
      } else {
        const sizeText = document.createTextNode(`${product.data.sizes[j]}`);
        size.appendChild(sizeText);
        sizes.appendChild(size);
      };
    };
    item_detail.appendChild(sizes);


    // qty
    const qty = document.createElement('div');
    qty.className = 'qty';
    const qtyText = document.createTextNode('數量 | ');
    qty.appendChild(qtyText);

    const qtyBar = document.createElement('input');
    qtyBar.type = 'number';
    qtyBar.name = 'qty';

    // 待處理：庫存問題（限制最高買的數量）

    // let qtyBarMinus = document.createElement("div");
    // qtyBarMinus.data-value = "-1";
    // qtyBar.appendChild(qtyBarMinus);

    // let qtyBarPlus = document.createElement("div");
    // qtyBarPlus.data-value = "1";
    // qtyBar.appendChild(qtyBarPlus);

    qty.appendChild(qtyBar);
    item_detail.appendChild(qty);

    appendProductDetail('note', product.data.note);
    appendProductDetail('texture', product.data.texture);
    appendProductDetail('description', product.data.description);
    appendProductDetail('wash', `清洗：${product.data.wash}`);
    appendProductDetail('place', `產地：${product.data.place}`);

    // product detail final
    document.getElementById('main-right').appendChild(item_detail);
    item_detail.className = 'item_detail';
    document.getElementById('more').innerHTML = '更多商品資訊';


    // more info
    const item_detail_more = document.createElement('div');

    const story = document.createElement('div');
    story.className = 'more_info_item';
    const storyText = document.createTextNode(`${product.data.story}`);
    story.appendChild(storyText);
    item_detail_more.appendChild(story);

    // other images
    for (i=0; i<product.data.images.length; i++) {
      const other_images = document.createElement('img');
      other_images.src = product.data.images[i];
      other_images.className = 'more_info_item';
      item_detail_more.appendChild(other_images);
    }
    document.getElementById('more-info').appendChild(item_detail_more);
  }
};

xhr.open('GET', `../api/v1.0/products/details?id=${pid}`);
xhr.send();

