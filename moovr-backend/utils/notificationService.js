const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const twilio = require("twilio");
const axios = require("axios");
const { getIo } = require("../socket");
const Notification = require("../models/Notification");

// Twilio Setup
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Nodemailer Setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send System (Socket.io) Notification and persist to DB
 */
const sendSystemNotification = async (target, event, data, title) => {
  try {
    const io = getIo();
    const notificationTarget = target === "all" ? "all" : `user_${target.toString()}`;
    console.log(`sendSystemNotification: event=${event}, target=${notificationTarget}, dataId=${data?._id || data?.id || 'none'}, title=${title}`);

    if (target === "all") {
      io.emit(event, data);
    } else {
      // Emit to the prefixed user room so clients that joined `user_{id}` receive events
      io.to(`user_${target.toString()}`).emit(event, data);

      // Persist to database for specific user
      await Notification.create({
        recipient: target,
        title: title || "New Notification",
        message: data.message || "You have a new update",
        type: event,
        data: data,
      });
    }
    console.log(`System notification sent to ${notificationTarget}: ${event}`);
  } catch (error) {
    console.error("Error sending system notification:", error.message);
  }
};

/**
 * Send Push Notification via Firebase Cloud Messaging (FCM)
 */
const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  if (!fcmToken) return;
  
  const message = {
    notification: {
      title,
      body,
    },
    data: {
      ...data,
      click_action: "FLUTTER_NOTIFICATION_CLICK", // For mobile apps if applicable
    },
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log(`Push notification sent successfully: ${response}`);
  } catch (error) {
    console.error(`Error sending push notification:`, error.message);
  }
};

/**
 * Send Email Notification via Nodemailer or Firebase Cloud Function
 */
const sendEmailNotification = async (email, subject, text, html, type, data) => {
  if (!email) return;

  // Option 1: Use Firebase Cloud Function (if URL is provided)
  if (process.env.FIREBASE_FUNCTION_URL) {
    try {
      const response = await axios.post(process.env.FIREBASE_FUNCTION_URL, {
        email,
        subject,
        message: text,
        html: html || text,
        type,
        rideData: data
      });
      console.log(`Email sent via Cloud Function to ${email}: ${response.data.messageId}`);
      return;
    } catch (error) {
      console.error(`Error sending email via Cloud Function:`, error.response?.data || error.message);
      // Fallback to nodemailer if Cloud Function fails
    }
  }

  // Option 2: Use Nodemailer (Fallback)
  if (!process.env.EMAIL_USER) {
    console.warn("EMAIL_USER not configured. Skipping email notification.");
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Moovr" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      text: text,
      html: html || text,
    });
    console.log(`Email sent to ${email}: ${info.messageId}`);
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error.message);
  }
};

/**
 * Send SMS Notification via Twilio
 */
const sendSMSNotification = async (phoneNumber, message) => {
  if (!phoneNumber || !process.env.TWILIO_PHONE_NUMBER) return;
  try {
    const response = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    console.log(`SMS sent to ${phoneNumber}: ${response.sid}`);
  } catch (error) {
    console.error(`Error sending SMS to ${phoneNumber}:`, error.message);
  }
};

/**
 * Multi-channel Notification Utility
 */
const notifyUser = async (user, { event, data, message, subject, type, title }) => {
  if (!user) return;

  const notificationData = { ...data, message };

  // 1. System Notification (Always) - Persists to DB
  await sendSystemNotification(user._id, event, notificationData, title || subject);

  // 2. Push Notification (FCM)
  if (user.fcmToken) {
    await sendPushNotification(user.fcmToken, subject || title, message, { event });
  }

  // 3. Email Notification
  if (user.email) {
    await sendEmailNotification(user.email, subject || title, message, null, type || event, data);
  }

  // 4. SMS Notification
  if (user.phone) {
    await sendSMSNotification(user.phone, message);
  }
};

module.exports = {
  notifyUser,
  sendSystemNotification,
  sendPushNotification,
  sendEmailNotification,
  sendSMSNotification,
};
