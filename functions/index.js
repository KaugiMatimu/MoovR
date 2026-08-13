const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Lazy initialization of transporter
let transporter;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

/**
 * sendRideNotification - HTTPS function to send ride request and completion notifications
 */
exports.sendRideNotification = onRequest(async (req, res) => {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { email, subject, message, html, type, rideData } = req.body;

  if (!email || !subject) {
    return res.status(400).send("Missing required fields: email, subject");
  }

  try {
    const mailTransporter = getTransporter();
    let emailHtml = html;

    // Generate specialized templates if rideData is provided
    if (type === "ride_request" && rideData) {
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #000; text-align: center;">Ride Requested</h2>
          <p>Hi there,</p>
          <p>Your ride has been successfully requested and we are looking for a driver near you.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Pickup:</strong> ${rideData.pickupLocation}</p>
            <p><strong>Dropoff:</strong> ${rideData.dropoffLocation}</p>
            <p><strong>Estimated Fare:</strong> ₦${rideData.fare}</p>
            <p><strong>Vehicle:</strong> ${rideData.vehicleType}</p>
          </div>
          <p style="text-align: center; color: #666; font-size: 12px;">Thank you for choosing Moovr!</p>
        </div>
      `;
    } else if (type === "ride_complete" && rideData) {
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #000; text-align: center;">Ride Completed</h2>
          <p>Hi,</p>
          <p>We hope you enjoyed your ride. Here is your receipt.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Total Fare:</strong> ₦${rideData.fare}</p>
            <p><strong>Payment Method:</strong> ${rideData.paymentMethod}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 10px 0;">
            <p><strong>From:</strong> ${rideData.pickupLocation}</p>
            <p><strong>To:</strong> ${rideData.dropoffLocation}</p>
            <p><strong>Distance:</strong> ${rideData.distance} km</p>
          </div>
          <p style="text-align: center;">Please rate your driver in the app!</p>
          <p style="text-align: center; color: #666; font-size: 12px;">Moovr - Moving you forward.</p>
        </div>
      `;
    }

    const mailOptions = {
      from: `"Moovr" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      text: message || "Moovr Notification",
      html: emailHtml || message,
    };

    const info = await mailTransporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    res.status(200).send({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send({ success: false, error: error.message });
  }
});
