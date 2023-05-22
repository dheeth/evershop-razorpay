import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import useRazorpay from 'react-razorpay';
import { useCheckout } from '@components/common/context/checkout';
import { useQuery } from 'urql';
import RazorpayLogo from './RazorpayLogo';

const cartQuery = `
  query Query($cartId: String) {
    cart(id: $cartId) {
      billingAddress {
        cartAddressId
        fullName
        postcode
        telephone
        country {
          name
          code
        }
        province {
          name
          code
        }
        city
        address1
        address2
      }
      shippingAddress {
        cartAddressId
        fullName
        postcode
        telephone
        country {
          name
          code
        }
        province {
          name
          code
        }
        city
        address1
        address2
      }
      customerEmail
    }
  }
`;
function RazorpayApp({ orderId, orderPlaced, cartId, checkoutSuccessUrl }) {
  const [razorpayOrderId, setRazorpayOrderId] = useState('');
  const [result] = useQuery({
    query: cartQuery,
    variables: {
      cartId
    },
    pause: orderPlaced === true
  });
  useEffect(() => {
    // Create PaymentIntent as soon as the order is placed
    if (orderId && orderPlaced) {
      window
        .fetch('/api/razorpay/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ order_id: orderId })
        })
        .then((res) => res.json())
        .then((data) => {
          setRazorpayOrderId(data.id);
          handlePayment(result, data.amount, data.id, data.key);
        });
    }
  }, [orderId]);

  const Razorpay = useRazorpay();

  const handlePayment = (result, amount, razorpayOrderId, razorpayKey) => {
    const billingAddress =
      result.data.cart.billingAddress || result.data.cart.shippingAddress;
    const options = {
      key: razorpayKey,//process.env?.RAZORPAY_KEY, // Enter the Key ID generated from the Dashboard
      amount: Number(amount), // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency: 'INR',
      name: 'Company Name',
      description: `Craeted order for`,
      image: 'https://example.com/your_logo',
      order_id: razorpayOrderId, //This is a sample Order ID. Pass the `id` obtained in the response of createOrder().
      handler: (response) => {
        if (response) {
          window
            .fetch('/api/razorpay/order/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(response)
            })
            .then((res) => res.json())
            .then((data) => {
              if (data) {
                window.location.href = `${checkoutSuccessUrl}/${orderId}`;
              }
            });
        }
      },
      prefill: {
        name: billingAddress.fullName,
        email: result.data.cart.customerEmail,
        contact: billingAddress.telephone
      },
      notes: {
        address: `${billingAddress.address1}, ${billingAddress.city}, ${billingAddress.postcode}, ${billingAddress.province.code}, ${billingAddress.country.code}`
      },
      theme: {
        color: '#3399cc'
      }
    };

    const rzp1 = new Razorpay(options);
    rzp1.on('payment.failed', function (response) {
      console.log('Payment Failed', response);
      // Handle failed payment
    });
    rzp1.open();
  };
  return (
    <div className="p-2 text-center border rounded mt-1 border-divider">
      You can Pay via UPI, Credit/Debit Card, Pay Later and Net Banking
    </div>
  );
}

RazorpayApp.propTypes = {
  orderId: PropTypes.string.isRequired,
  orderPlaced: PropTypes.bool.isRequired
};

export default function RazorpayMethod({ setting }) {
  // Get the selected payment
  const {
    paymentMethods,
    setPaymentMethods,
    checkoutSuccessUrl,
    orderPlaced,
    orderId,
    cartId
  } = useCheckout();
  const selectedPaymentMethod = paymentMethods
    ? paymentMethods.find((paymentMethod) => paymentMethod.selected)
    : undefined;

  return (
    <div>
      <div className="flex justify-start items-center gap-1">
        {(!selectedPaymentMethod ||
          selectedPaymentMethod.code !== 'razorpay') && (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPaymentMethods((previous) =>
                previous.map((paymentMethod) => {
                  if (paymentMethod.code === 'razorpay') {
                    return {
                      ...paymentMethod,
                      selected: true
                    };
                  } else {
                    return {
                      ...paymentMethod,
                      selected: false
                    };
                  }
                })
              );
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
            </svg>
          </a>
        )}
        {selectedPaymentMethod && selectedPaymentMethod.code === 'razorpay' && (
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2c6ecb"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        )}
        <div><RazorpayLogo width={70} /></div>
      </div>
      <div>
        {selectedPaymentMethod && selectedPaymentMethod.code === 'razorpay' && (
          <div>
            <RazorpayApp
              orderPlaced={orderPlaced}
              orderId={orderId}
              cartId={cartId}
              checkoutSuccessUrl={checkoutSuccessUrl}
            />
          </div>
        )}
      </div>
    </div>
  );
}

RazorpayMethod.propTypes = {
  setting: PropTypes.shape({
    razorpayPublishableKey: PropTypes.string.isRequired
  }).isRequired
};

export const layout = {
  areaId: 'checkoutPaymentMethodrazorpay',
  sortOrder: 20
};

export const query = `
  query Query {
    setting {
      razorpayDislayName
      razorpayPublishableKey
    }
  }
`;
