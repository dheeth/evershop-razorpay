const { Cart } = require('@evershop/evershop/src/modules/checkout/services/cart/Cart');
const { getSetting } = require('@evershop/evershop/src/modules/setting/services/setting');

module.exports = () => {
  Cart.addField('payment_method', async function resolver(previousValue) {
    const paymentMethod = this.dataSource?.payment_method ?? null;
    console.log(paymentMethod)
    if (paymentMethod !== 'razorpay') {
      return previousValue;
    } else {
      // Validate the payment method
      const razorpayStatus = await getSetting('razorpayPaymentStatus');
      if (parseInt(razorpayStatus, 10) !== 1) {
        return previousValue;
      } else {
        delete this.errors.payment_method;
        return paymentMethod;
      }
    }
  });
};
