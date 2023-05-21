const { execute } = require('@evershop/postgres-query-builder');

// eslint-disable-next-line no-multi-assign
module.exports = exports = async (connection) => {
  await execute(connection, `CREATE TABLE razorpay_payment_transaction_mapping (
  id serial PRIMARY KEY,
  razorpay_order_id VARCHAR ( 50 ) NOT NULL
  )`);
};