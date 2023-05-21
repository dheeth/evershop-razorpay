const { getConfig } = require('@evershop/evershop/src/lib/util/getConfig');
const { getSetting } = require('@evershop/evershop/src/modules/setting/services/setting');

// eslint-disable-next-line no-unused-vars
module.exports = async (request, response) => {
  // Check if Stripe is enabled
  const config = getConfig('system.razorpay', {});
  let status;
  if (config.status) {
    status = config.status;
  } else {
    status = await getSetting('razorpayPaymentStatus', 0);
  }
  if (parseInt(status, 10) === 1) {
    return {
      methodCode: 'razorpay',
      methodName: await getSetting('razorpayDislayName', 'Razorpay')
    };
  } else {
    return null;
  }
};
