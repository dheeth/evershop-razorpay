/* eslint-disable global-require */
const {
  insert,
  update,
  commit,
  rollback,
  select,
  startTransaction
} = require('@evershop/postgres-query-builder');
const {
  getConnection, pool
} = require('@evershop/evershop/src/lib/postgres/connection');
const { getConfig } = require('@evershop/evershop/src/lib/util/getConfig');
const { getSetting } = require('@evershop/evershop/src/modules/setting/services/setting');
const crypto = require('crypto');
const { OK, INTERNAL_SERVER_ERROR } = require('@evershop/evershop/src/lib/util/httpStatus');
// eslint-disable-next-line no-unused-vars
module.exports = async (request, response, stack, next) => {
  try {
    const connection = await getConnection();
    const config = getConfig('system.razorpay', {});
    let endpointSecret;
    if (config.endpointSecret) {
      endpointSecret = config.endpointSecret;
    } else {
      endpointSecret = await getSetting('razorpayEndpointSecret', '');
    }
    const data = crypto.createHmac('sha256', endpointSecret);
    data.update(request.body);
    const digest = data.digest('hex');
    if (digest === request.headers['x-razorpay-signature']) {
      const body = JSON.parse(request.body.toString());
      await startTransaction(connection);
      const order = await select()
      .from('order')
      .where('razorpay_order_id', '=', body.payload.payment.entity.order_id)
      .load(connection);
      switch (body.event) {
        case 'payment.captured': {
          await update('payment_transaction')
            .given({ payment_action: 'Capture' })
            .where('transaction_id', '=',  body.payload.payment.entity.id)
            .execute(connection);        

          await update('order')
            .given({ payment_status: 'paid' })
            .where('order_id', '=', order.order_id)
            .execute(connection);

          await insert('order_activity')
            .given({
              order_activity_order_id: order.order_id,
              comment: `Customer paid by using ${body.payload.payment.entity.method}`,
              customer_notified: 0
            })
            .execute(connection);
          break;
        }
        case 'payment.authorized': {
          let transactionId;
          if(body.payload.payment.entity.method === 'upi'){
           transactionId = body.payload.payment.entity.acquirer_data.rrn
          }else if(body.payload.payment.entity.method === 'netbanking'){
            transactionId = body.payload.payment.entity.acquirer_data.bank_transaction_id
          }else if(body.payload.payment.entity.method === 'card'){
            transactionId = body.payload.payment.entity.acquirer_data.auth_code
          }else {
            transactionId = body.payload.payment.entity.acquirer_data.transaction_id
          }

          await insert('payment_transaction')
            .given({
              amount: body.payload.payment.entity.amount,
              payment_transaction_order_id: order.order_id,
              transaction_id: body.payload.payment.entity.id,
              transaction_type: body.payload.payment.entity.method,
              payment_action: 'Authorize'
            })
            .execute(connection);
          break;
        }
        case 'payment.failed': {
          await insert('payment_transaction')
          .given({
            amount: body.payload.payment.entity.amount,
            payment_transaction_order_id: order.order_id,
            transaction_id: body.payload.payment.entity.id,
            transaction_type: body.payload.payment.entity.method,
            payment_action: 'Failed'
          })
          .execute(connection);
          break;
        }
        default: {
          // eslint-disable-next-line no-console
          console.log(`Unhandled event type ${body.event}`);
        }
      }
    }
    await commit(connection);
    return response.status(OK).json({message: "OK"});
  } catch (err) {
    await rollback(connection);
    return response.status(INTERNAL_SERVER_ERROR).send('Something went wrong');
  }
};
