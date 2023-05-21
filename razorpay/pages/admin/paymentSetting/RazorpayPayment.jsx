import PropTypes from 'prop-types';
import React from 'react';
import { Field } from '@components/common/form/Field';
import { Toggle } from '@components/common/form/fields/Toggle';
import { Card } from '@components/admin/cms/Card';

export default function RazorpayPayment({
  setting: {
    razorpayPaymentStatus,
    razorpayDislayName,
    razorpayPublishableKey,
    razorpaySecretKey,
    razorpayEndpointSecret
  }
}) {
  return (
    <Card title="Razorpay Payment">
      <Card.Session>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1 items-center flex">
            <h4>Enable?</h4>
          </div>
          <div className="col-span-2">
            <Toggle name="razorpayPaymentStatus" value={razorpayPaymentStatus} />
          </div>
        </div>
      </Card.Session>
      <Card.Session>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1 items-center flex">
            <h4>Dislay Name</h4>
          </div>
          <div className="col-span-2">
            <Field
              type="text"
              name="razorpayDislayName"
              placeholder="Dislay Name"
              value={razorpayDislayName}
            />
          </div>
        </div>
      </Card.Session>
      <Card.Session>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1 items-center flex">
            <h4>Publishable Key</h4>
          </div>
          <div className="col-span-2">
            <Field
              type="text"
              name="razorpayPublishableKey"
              placeholder="Publishable Key"
              value={razorpayPublishableKey}
            />
          </div>
        </div>
      </Card.Session>
      <Card.Session>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1 items-center flex">
            <h4>Secret Key</h4>
          </div>
          <div className="col-span-2">
            <Field
              type="text"
              name="razorpaySecretKey"
              placeholder="Secret Key"
              value={razorpaySecretKey}
            />
          </div>
        </div>
      </Card.Session>
      <Card.Session>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1 items-center flex">
            <h4>Webhook Secret Key</h4>
          </div>
          <div className="col-span-2">
            <Field
              type="text"
              name="razorpayEndpointSecret"
              placeholder="Secret Key"
              value={razorpayEndpointSecret}
            />
          </div>
        </div>
      </Card.Session>
    </Card>
  );
}

RazorpayPayment.propTypes = {
  setting: PropTypes.shape({
    razorpayPaymentStatus: PropTypes.bool,
    razorpayDislayName: PropTypes.string,
    razorpayPublishableKey: PropTypes.string,
    razorpaySecretKey: PropTypes.string,
    razorpayEndpointSecret: PropTypes.string
  }).isRequired
};

export const layout = {
  areaId: 'paymentSetting',
  sortOrder: 15
};

export const query = `
  query Query {
    setting {
      razorpayDislayName
      razorpayPaymentStatus
      razorpayPublishableKey
      razorpaySecretKey
      razorpayEndpointSecret
    }
  }
`;
