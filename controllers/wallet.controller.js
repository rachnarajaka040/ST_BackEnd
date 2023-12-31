const wallet = require("../model/wallet.model");
const wallet_transaction = require("../model/wallet_transaction.model");
const User = require("../model/user.model");
const Role = require("../model/role.model");
const Razorpay = require("razorpay");
const db = require("../model");
const b2bUser = db.userb2b;
const {
  actionCompleteResponse,
  sendActionFailedResponse,
} = require("../common/common");
const { findByIdAndUpdate } = require("../model/international.model");
const crypto = require("crypto");

// exports.add_amount = async(req,res)=>{

//     const {userId,currency} = req.body;
//     try {
//           const data = await wallet.find({userId:{$in:[userId]}});
//           const isExistUser = await User.findById(userId);
//           console.log(data.length);
//           console.log(isExistUser);
//           if(data.length !== 0){
//             const msg = 'user wallet already exists';
//             actionCompleteResponse(res, {}, msg);
//           }else if(isExistUser !== null){
//           const response = await wallet.create({userId,currency,status:"successful"});
//           const msg = 'Amount added successfully'
//           actionCompleteResponse(res, response, msg);
//         }else{
//           const msg = 'user not exist';
//           actionCompleteResponse(res, {}, msg);
//         }

//     } catch (error) {
//         sendActionFailedResponse(res, {}, error.message);
//     }
// }

exports.update_amount = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(req.body.isAdmin);
    // console.log(user.roles[0].toString());
    const role = await Role.findById(user.roles[0].toString());
    //  console.log(r.name);
    if (role.name === "admin") {
      const response = await wallet.findById(id);
      const balance = Number(response.balance) + Number(req.body.balance);
      const { currency } = req.body;
      const data = await wallet.findByIdAndUpdate(id, { balance, currency });
      var size = Object.keys(data).length;
      if (size > 0) {
        const resData = await b2bUser.findOne({ walletid: id });
        console.log(resData.walletid);
        const user = await b2bUser.findOneAndUpdate(
          { walletid: id },
          { $set: { balance: balance } },
          { new: true }
        );
      }

      const msg = "amount updated successfully";
      actionCompleteResponse(res, data, msg);
    } else {
      const msg = "only Admin can add balance in wallet";
      actionCompleteResponse(res, {}, msg);
    }
  } catch (error) {
    console.log(error);
    sendActionFailedResponse(res, {}, error.message);
  }
};

exports.showWallet = async (req, res) => {
  try {
    const response = await wallet.findById(req.params.id);
    const msg = "successfully wallet";
    actionCompleteResponse(res, response, msg);
  } catch (error) {
    sendActionFailedResponse(res, {}, error.message);
  }
};

exports.pay_amount = async (req, res) => {
  try {
    const response = await wallet.findById(req.params.id);
    const user = await User.findById(response.userId);
    // console.log(user);
    if (Number(response.balance) >= Number(req.body.amount)) {
      const balance = Number(response.balance) - req.body.amount;
      // console.log(balance);
      const updateWallet = await wallet.findByIdAndUpdate(req.params.id, {
        balance,
      });
      const transactionId = crypto.createHash("md5").digest("hex").toString();
      // console.log(transactionId);
      const data = {
        userId: response.userId,
        transactionId: transactionId,
        name: user.username,
        email: user.email,
        phone: user.phone,
        amount: req.body.amount,
        currency: response.currency,
        paymentStatus: "successful",
      };
      const transactionEntry = await wallet_transaction.create(data);
      const msg = "payment transaction confirmed";
      actionCompleteResponse(res, transactionEntry, msg);
    } else {
      const msg = "no sufficient balance available in wallet";
      actionCompleteResponse(res, {}, msg);
    }
  } catch (err) {
    sendActionFailedResponse(res, {}, err.message);
  }
};

exports.showTransactions = async (req, res) => {
  try {
    const response = await wallet_transaction.find({
      userId: { $in: [req.params.id] },
    });
    const msg = " user transactions";
    actionCompleteResponse(res, response, msg);
  } catch (error) {
    sendActionFailedResponse(res, {}, error.message);
  }
};

/// payment

exports.rechargeWallet = (req, res) => {
  const amount = req.body.amount;
  try {
    let instance = new Razorpay({
      key_id: process.env.Razorpay_KEY_ID,
      key_secret: process.env.Razorpay_KEY_SECRET,
    });

    var options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: "order_rcptid_11",
    };
    console.log(amount);
    instance.orders.create(options, function (err, order) {
      if (err) {
        return res.send({ code: 500, message: "Server Error" });
      }
      console.log(order);
      return res.send({
        code: 200,
        message: "order Created Successfully",
        data: order,
      });
    });
  } catch (err) {
    console.log(err);
    sendActionFailedResponse(res, {}, err.message);
  }
};

//verifyPayment
// exports.verifyPayment = (req, res) => {
//   try {
//     res.send({ verify });
//   } catch (err) {
//     console.log(err);
//     sendActionFailedResponse(res, {}, err.message);
//   }
// };

// exports.updateRozarPay = async (req, res) => {
//   const userId = req.params.id; // Assuming you have user authentication middleware
//   const amountFlight = req.body.amount;

//   try {
//     // Create a Razorpay order
//     let instance = new Razorpay({
//       key_id: process.env.Razorpay_KEY_ID,
//       key_secret: process.env.Razorpay_KEY_SECRET,
//     });

//     var options = {
//       amount: amountFlight * 100, // amount in the smallest currency unit
//       currency: "INR",
//       receipt: "order_rcptid_11",
//     };

//     instance.orders.create(options, async function (err, order) {
//       if (err) {
//         return res.status(500).json({ code: 500, message: "Server Error" });
//       }

//       // Assuming the order creation was successful
//       console.log(order);

//       // Now, update the user's wallet balance
//       try {
//         const userWallet = await wallet.findOne({ user: userId });

//         if (!userWallet) {
//           return res
//             .status(404)
//             .json({ message: "Wallet not found for the user" });
//         }

//         const balance = Number(userWallet.balance) + Number(amountFlight);
//         const { currency } = "INR";

//         // Update the user's wallet balance
//         userWallet.balance = balance;
//         userWallet.currency = currency;
//         await userWallet.save();

//         // Update the b2bUser balance if necessary
//         const resData = await b2bUser.findOne({ walletid: userWallet._id });
//         if (resData) {
//           await b2bUser.findOneAndUpdate(
//             { walletid: userWallet._id },
//             { $set: { balance: balance } },
//             { new: true }
//           );
//         }

//         const msg = "Wallet balance updated successfully";
//         return res
//           .status(200)
//           .json({ message: msg, updatedWallet: userWallet, order });
//       } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: "Server Error" });
//       }
//     });
//   } catch (err) {
//     console.log(err);
//     sendActionFailedResponse(res, {}, err.message);
//   }
// };
