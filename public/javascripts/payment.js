/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
TPDirect.setupSDK(12348, 'app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF', 'sandbox');
TPDirect.card.setup({
  fields: {
    number: {
      element: '.form-control.card-number',
      placeholder: '**** **** **** ****',
    },
    expirationDate: {
      element: document.getElementById('tappay-expiration-date'),
      placeholder: 'MM / YY',
    },
    ccv: {
      element: $('.form-control.cvc')[0],
      placeholder: '後三碼',
    },
  },
  styles: {
    'input': {
      'color': 'gray',
    },
    'input.cvc': {
      'font-size': '16px',
    },
    ':focus': {
      'color': 'black',
    },
    '.valid': {
      'color': 'green',
    },
    '.invalid': {
      'color': 'red',
    },
    '@media screen and (max-width: 400px)': {
      'input': {
        'color': 'orange',
      },
    },
  },
});
// listen for TapPay Field
TPDirect.card.onUpdate(function(update) {
  /* Disable / enable submit button depend on update.canGetPrime  */
  /* ============================================================ */

  // update.canGetPrime === true
  //     --> you can call TPDirect.card.getPrime()
  // const submitButton = document.querySelector('button[type="submit"]')
  if (update.canGetPrime) {
    // submitButton.removeAttribute('disabled')
    $('button[type="submit"]').removeAttr('disabled');
  } else {
    // submitButton.setAttribute('disabled', true)
    $('button[type="submit"]').attr('disabled', true);
  }


  /* Change card type display when card type change */
  /* ============================================== */

  // cardTypes = ['visa', 'mastercard', ...]
  const newType = update.cardType === 'unknown' ? '' : update.cardType;
  $('#cardtype').text(newType);


  /* Change form-group style when tappay field status change */
  /* ======================================================= */

  // number 欄位是錯誤的
  if (update.status.number === 2) {
    setNumberFormGroupToError('.card-number-group');
  } else if (update.status.number === 0) {
    setNumberFormGroupToSuccess('.card-number-group');
  } else {
    setNumberFormGroupToNormal('.card-number-group');
  }

  if (update.status.expiry === 2) {
    setNumberFormGroupToError('.expiration-date-group');
  } else if (update.status.expiry === 0) {
    setNumberFormGroupToSuccess('.expiration-date-group');
  } else {
    setNumberFormGroupToNormal('.expiration-date-group');
  }

  if (update.status.cvc === 2) {
    setNumberFormGroupToError('.cvc-group');
  } else if (update.status.cvc === 0) {
    setNumberFormGroupToSuccess('.cvc-group');
  } else {
    setNumberFormGroupToNormal('.cvc-group');
  }
});

$('form').on('submit', function(event) {
  event.preventDefault();

  // fix keyboard issue in iOS device
  forceBlurIos();

  const tappayStatus = TPDirect.card.getTappayFieldsStatus();
  console.log(tappayStatus);

  if (tappayStatus.canGetPrime === false) {
    alert('無法取得授權！');
    return;
  }

  TPDirect.card.getPrime(function(result) {
    if (result.status !== 0) {
      alert('授權失敗！');
      return;
    }
    alert('授權成功！');

    const product = JSON.parse(xhr.responseText);
    console.log(product);

    const orderData = {
      'prime': result.card.prime,
      'partner_key': 'partner_PHgswvYEk4QY6oy3n8X3CwiQCVQmv91ZcFoD5VrkGFXo8N7BFiLUxzeG',
      'merchant_id': 'AppWorksSchool_CTBC',
      'order': {
        'userid': 16,
        'shipping': 'delivery',
        'payment': 'credit_card',
        'subtotal': 1234,
        'freight': 14,
        'total': 1300,
        'recipient': {
          'name': 'Luke',
          'phone': '0987654321',
          'email': 'luke@gmail.com',
          'address': '市政府站',
          'time': 'morning',
        },
        'list': [
          {
            'id': product.data.id,
            'name': product.data.title,
            'price': product.data.price,
            'color': { // pending: parse from input
              'code': product.data.colors[0].code,
              'name': product.data.colors[0].name,
            },
            'size': product.data.sizes[0], // pending: parse from input
            'qty': 3, // pending: parse from input
          },
        ],
      },
    };
    console.log(orderData);

    // send data to order.js to put order data in db
    // redirect to thankyou page
    $.ajax({
      url: '../../api/v1.0/order/checkout',
      method: 'POST',
      data: JSON.stringify(orderData),
      dataType: 'json',
      contentType: 'application/json;charset=utf-8',
      success: function(response) {
        window.location.href = `thankyou.html?orderid=${response.data.number}`;
      },
    });
  });
});

function setNumberFormGroupToError(selector) {
  $(selector).addClass('has-error');
  $(selector).removeClass('has-success');
}

function setNumberFormGroupToSuccess(selector) {
  $(selector).removeClass('has-error');
  $(selector).addClass('has-success');
}

function setNumberFormGroupToNormal(selector) {
  $(selector).removeClass('has-error');
  $(selector).removeClass('has-success');
}

function forceBlurIos() {
  if (!isIos()) {
    return;
  }
  const input = document.createElement('input');
  input.setAttribute('type', 'text');
  // Insert to active element to ensure scroll lands somewhere relevant
  document.activeElement.prepend(input);
  input.focus();
  input.parentNode.removeChild(input);
}

function isIos() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}
