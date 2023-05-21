# evershop-razorpay
Razorpay extension for evershop.

# Installation
npm i evershop-razorpay

Add the extension to your config/default.json file:

{
  "system": {
        "extensions": [
            {
                "name": "razorpay",
                "resolve": "node_modules/evershop-razorpay/razorpay",
                "enabled": true
            }
        ]
    }
}