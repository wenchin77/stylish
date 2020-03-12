const express = require('express');
const router = express.Router();
const db = require('../../db.js');
const https = require('https');

router.post('/checkout', async (req, res) => {
    // 1. Receive prime and order data from front-end.
    const prime = req.body.prime;
    const userid= req.body.order.userid;
    const shipping = req.body.order.shipping;
    const payment = req.body.order.payment;
    const subtotal = req.body.order.subtotal;
    const freight = req.body.order.freight;
    const total = req.body.order.total;
    const recipient_name = req.body.order.recipient.name;
    const recipient_phone = req.body.order.recipient.phone;
    const recipient_email = req.body.order.recipient.email;
    const recipient_address = req.body.order.recipient.address;
    const recipient_time = req.body.order.recipient.time;
    const pid = req.body.order.list[0].id;
    const title = req.body.order.list[0].name;
    const price = req.body.order.list[0].price;
    const color_code = req.body.order.list[0].color.code;
    const color_name = req.body.order.list[0].color.name;
    const size = req.body.order.list[0].size;
    const qty = req.body.order.list[0].qty;

    const post_data = {
        "prime": prime,
        "partner_key": req.body.partner_key,
        "merchant_id": req.body.merchant_id,
        "amount": qty,
        "currency": "TWD",
        "details": "An apple and a pen.",
        "cardholder": {
            "phone_number": recipient_phone,
            "name": recipient_name,
            "email": recipient_email
        },
        "remember": false
    }




    // 2. Create an unpaid order record in the database.
    let orderid;
    let addOrderSql = `INSERT INTO user_order (payment_status, prime, userid, shipping, payment, subtotal, freight, total, recipient_name, recipient_phone, recipient_email, recipient_address, recipient_time) 
                      VALUES ('unpaid', '${prime}', '${userid}', '${shipping}', '${payment}', '${subtotal}', '${freight}', '${total}', '${recipient_name}', '${recipient_phone}', '${recipient_email}', '${recipient_address}', '${recipient_time}')`
    await db.query(addOrderSql, async (err, res) => {
        if (err) throw err;
        console.log('ORDER RECORDED')

        let getOrderId = `SELECT orderid FROM user_order
        WHERE prime = '${prime}';`
        await db.query(getOrderId, async (err, res) => {
            if (err) throw err;
            console.log('ORDERID RECORDED')
            orderid = res[0].orderid;

            let addOrderItemSql = `INSERT INTO order_item (orderid, pid, title, price, color_name, color_code, size, qty) 
                                VALUES (${orderid}, ${pid}, '${title}', ${price}, '${color_name}', '${color_code}', '${size}', ${qty});`

            await db.query(addOrderItemSql, (err, res) => {
                if (err) throw err;
                console.log('ORDER ITEMS RECORDED')
            })
        })
        
    })

    
    
    // 3. Send prime and other necessary data to TapPay server for payment processing.
    const post_options = {
        host: 'sandbox.tappaysdk.com',
        port: 443,
        path: '/tpc/payment/pay-by-prime',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // 這個參數必須要帶上去，否則不會過
            'x-api-key': 'partner_PHgswvYEk4QY6oy3n8X3CwiQCVQmv91ZcFoD5VrkGFXo8N7BFiLUxzeG'
        }
    }


    // 4. Receive payment result from TapPay server.
    // 5. If payment is successful, create a payment record in the database and update existed unpaid order record to paid. 
    // Otherwise, send payment error message to front-end
    // 紀錄付款時間：insert into payment_time 欄位
    const post_req = https.request(post_options, function(response) {
        response.setEncoding('utf8');
        response.on('data', function (body) {
            let msg = JSON.parse(body).msg
            let payment_time = JSON.parse(body).transaction_time_millis
            if (msg == 'Success') {
                let addOrderSql = `UPDATE user_order SET payment_status = 'paid', payment_time = '${payment_time}' WHERE prime = '${prime}'`
                db.query(addOrderSql, (err, res) => {
                    if (err) throw err;
                    console.log('PAYMENT UPDATED');
                })
            } else {
                res.send(`Payment error: ${msg}`)
            }
            return res.json({ 
                data: {
                    number: orderid,
                }
            });
        });

    });

    post_req.write(JSON.stringify(post_data));
    post_req.end();
})







module.exports = router;



