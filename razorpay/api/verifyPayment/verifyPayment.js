const { getConfig } = require('@evershop/evershop/src/lib/util/getConfig');
const { getSetting } = require('@evershop/evershop/src/modules/setting/services/setting');

// eslint-disable-next-line no-unused-vars
const crypto = require('crypto');
const { OK } = require('@evershop/evershop/src/lib/util/httpStatus');
module.exports = async (request, response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    request.body;
  const razorpayConfig = getConfig('system.razorpay', {});
  let secretKey;
  if (razorpayConfig.secretKey) {
    secretKey = razorpayConfig.secretKey;
  } else {
    secretKey = await getSetting('razorpaySecretKey', '');
  }
  const signature = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(signature.toString())
    .digest('hex');
  const isAuthentic = expectedSignature === razorpay_signature;
  response.status(OK).json({ isPaymentVerified: isAuthentic });
};
