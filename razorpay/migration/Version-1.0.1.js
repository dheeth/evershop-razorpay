const { execute } = require('@evershop/postgres-query-builder');

// eslint-disable-next-line no-multi-assign
module.exports = exports = async (connection) => {
  await execute(connection, `ALTER TABLE "order" ADD COLUMN razorpay_order_id VARCHAR(50) DEFAULT NULL;`);
};