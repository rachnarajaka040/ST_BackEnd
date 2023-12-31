const joi = require('joi');
joi.objectId = require('joi-objectid')(joi);
const schemas = { 
  flightBookingSchema: joi.object().keys({ 
    
    userId:joi.objectId,
    firstName:joi.string().required(),
    lastName:joi.string().required(),
    gender:joi.string().max(5).required(),
    phone:{
        country_code:joi.string().max(4).required(),
        mobile_number:joi.string().max(10).required(),
    },
    dob:joi.string().required(),
    email:joi.string().email().required(),
    address:joi.string().required(),
    city:joi.string().required(),
    country:joi.string().required(),
    flightName:joi.string().required(),
    pnr:joi.number().required(),
    paymentStatus:joi.string().required(),
 }), 
  
 walletSchema:joi.object().keys({ 
        balance:joi.number().required(),
        userId:joi.objectId,
        currency:joi.string().max(3).required(),
  }), 
 
  addwalletAmountSchema: joi.object().keys({ 
    balance:joi.number().required(),
    currency:joi.string().max(3).required(),
    isAdmin:joi.objectId,
  }),
  payWalletAmount:joi.object().keys({
    amount:joi.number().required(),
  })  

}; 

module.exports = schemas;
