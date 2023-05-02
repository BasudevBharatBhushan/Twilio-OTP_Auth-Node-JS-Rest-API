const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const User = require("./model");
const cors = require("cors");

// Parse JSON and url-encoded request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const accountSid = "ACeb57428dadd77cdfa851714c8270d092";
const authToken = "c48c70d64e30dd089303e6641210c171";
const verifySid = "VAee80d19256770110e873815e93c20597";
const client = require("twilio")(accountSid, authToken);

mongoose
  .connect(
    "mongodb+srv://admin-basudev:OoAkYrt6dz3DGZQF@cluster0.nbsww.mongodb.net/Twilio",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("DB CONNECTED");
  });

app.get("/", (req, res) => {
  res.send("Hello World");
});
// Route for entering phone number
// Route for entering phone number
app.post("/phone", async (req, res) => {
  const phoneNumber = req.body.phoneNumber;

  // Check if phone number already exists in database
  const user = await User.findOne({ phone_number: phoneNumber });
  if (user) {
    res.json({ message: "You have already registered" });
    return;
  }

  // Send verification code to phone number
  client.verify.v2
    .services(verifySid)
    .verifications.create({ to: phoneNumber, channel: "sms" })
    .then((verification) => {
      console.log(verification.status);
      res.json({ message: "OTP Sent" });
    })
    .catch((error) => {
      console.error(error);
      res.json({ message: "Error sending OTP" });
    });
});

// Route for entering OTP
app.post("/otp", (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const otpCode = req.body.otpCode;

  // Verify OTP code
  client.verify.v2
    .services(verifySid)
    .verificationChecks.create({ to: phoneNumber, code: otpCode })
    .then(async (verification_check) => {
      console.log(verification_check.status);
      if (verification_check.status === "approved") {
        // Save phone number in database
        const user = new User({ phone_number: phoneNumber });
        try {
          await user.save();
          res.json({ message: "Phone number verified and saved" });
        } catch (error) {
          console.error(error);
          res.json({ message: "Error saving phone number" });
        }
      } else {
        res.json({ message: "Invalid OTP" });
      }
    })
    .catch((error) => {
      console.error(error);
      res.json({ message: "Error verifying OTP, Please try again" });
    });
});

// Start server
app.listen(4000, () => {
  console.log("Server listening on port 4000");
});
