# EverShop product comment extension

This is the source code for the EverShop extension development guide: [EverShop product comment extension](https://evershop.io/docs/development/module/create-first-extension).

## Installation

```bash
npm install evershop-razorpay
```

Add the extension to your `config/default.json` file:

```json
{
  "system": {
        "extensions": [
            {
                "name": "razorpy",
                "resolve": "node_modules/evershop-razorpay/razorpay",
                "enabled": true
            }
        ]
    }
}