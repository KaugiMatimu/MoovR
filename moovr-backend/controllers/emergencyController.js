const User = require("../models/User");
const Ride = require("../models/Ride");
const EmergencyLog = require("../models/EmergencyLog");
const { sendSMSNotification, sendSystemNotification, sendEmailNotification } = require("../utils/notificationService");
const { getIo } = require("../socket");

// Emergency Assist - notify emergency contacts, driver, and emit socket alert
exports.emergencyAssist = async (req, res) => {
  try {
    const user = req.user;
    const { rideId, coords } = req.body; // coords: { latitude, longitude }

    const locationText = coords ? `Location: ${coords.latitude},${coords.longitude}` : (user.location && user.location.coordinates ? `Location: ${user.location.coordinates[1]},${user.location.coordinates[0]}` : "Location unknown");

    const userName = `${user.firstName || "User"} ${user.lastName || ""}`.trim();
    const message = `${userName} activated Emergency Assist. ${locationText}`;
    const userPhone = user.phone || "Not available";

    // 1. Send SMS to ALL emergency contacts
    const emergencyContacts = user.emergencyContacts || [];
    const smsPromises = [];
    
    if (emergencyContacts.length > 0) {
      emergencyContacts.forEach((contact) => {
        if (contact.phone) {
          const smsMessage = `EMERGENCY: ${userName} needs help!\n${message}\nUser Phone: ${userPhone}`;
          smsPromises.push(
            sendSMSNotification(contact.phone, smsMessage).catch((err) => {
              console.error(`Failed to send SMS to ${contact.name} (${contact.phone}):`, err);
            })
          );
        }
      });
    }
    
    // Also send to default emergency number if no contacts configured
    if (emergencyContacts.length === 0) {
      const defaultEmergencyPhone = process.env.DEFAULT_EMERGENCY_NUMBER || "911";
      smsPromises.push(
        sendSMSNotification(defaultEmergencyPhone, message).catch((err) => {
          console.error(`Failed to send SMS to default emergency number:`, err);
        })
      );
    }

    // Execute all SMS sending in parallel
    await Promise.all(smsPromises);

    // 2. Emit socket event to ride room and user's personal room
    const io = getIo();
    const emergencyAlert = {
      userId: user._id,
      userName: userName,
      userPhone: userPhone,
      rideId,
      coords,
      message,
      timestamp: new Date(),
      emergencyContacts: emergencyContacts.map((c) => ({ name: c.name, contactType: c.contactType })),
    };

    if (rideId && io) {
      io.to(`ride_${rideId}`).emit("emergencyAlert", emergencyAlert);
    }
    if (io) {
      io.to(`user_${user._id}`).emit("emergencyAlert", emergencyAlert);
    }

    // 3. Notify driver if ride exists
    if (rideId) {
      const ride = await Ride.findById(rideId).populate("driver");
      if (ride && ride.driver) {
        await sendSystemNotification(
          ride.driver._id,
          "emergencyAlert",
          { ...emergencyAlert, driver: true },
          `🚨 Emergency Alert from ${userName}`
        );
      }
      
      // Also notify passenger if driver triggered emergency
      if (ride && ride.user && user._id.toString() === ride.driver._id.toString()) {
        await sendSystemNotification(
          ride.user._id,
          "driverEmergency",
          { ...emergencyAlert, driver: true },
          `🚨 Driver Emergency Alert`
        );
      }
    }

    // 4. Persist a system notification for the user
    await sendSystemNotification(user._id, "emergencyAssistTriggered", { message, rideId, coords, timestamp: new Date() }, "Emergency Assist Triggered");

    // 5. Create an audit log entry
    try {
      const log = await EmergencyLog.create({
        user: user._id,
        ride: rideId || null,
        coords: coords || null,
        message,
      });

      // 6. Send escalation alerts to admin channel(s) if configured
      const adminEmail = process.env.ADMIN_ALERT_EMAIL;
      const adminPhone = process.env.ADMIN_ALERT_PHONE;
      const subject = `🚨 Emergency Assist triggered by ${userName}`;
      const body = `${message}\nRide: ${rideId || "N/A"}\nLog ID: ${log._id}\nEmergency Contacts: ${emergencyContacts.map((c) => `${c.name} (${c.phone})`).join(", ") || "None"}`;

      if (adminEmail) {
        await sendEmailNotification(adminEmail, subject, body, `<pre>${body}</pre>`, "emergency", { logId: log._id });
      }
      if (adminPhone) {
        await sendSMSNotification(adminPhone, `${subject}\n${body}`).catch((err) => {
          console.error("Failed to send admin SMS:", err);
        });
      }
    } catch (err) {
      console.error("Failed to persist emergency log or notify admin:", err);
    }

    return res.status(200).json({
      message: "Emergency assist triggered successfully",
      details: {
        contactsNotified: emergencyContacts.length,
        emergencyContacts: emergencyContacts.map((c) => c.phone),
      },
    });
  } catch (error) {
    console.error("Emergency assist error:", error);
    return res.status(500).json({ message: "Unable to trigger emergency assist", error: error.message });
  }
};

// Get user's emergency contacts
exports.getEmergencyContacts = async (req, res) => {
  try {
    const user = req.user;
    const userRecord = await User.findById(user._id).select("emergencyContacts");

    if (!userRecord) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Emergency contacts retrieved",
      emergencyContacts: userRecord.emergencyContacts || [],
    });
  } catch (error) {
    console.error("Error retrieving emergency contacts:", error);
    res.status(500).json({ message: "Error retrieving emergency contacts", error: error.message });
  }
};

// Update emergency contacts for the authenticated user
exports.updateContacts = async (req, res) => {
  const userId = req.user._id;
  const { contacts } = req.body; // expect [{ contactType, name, phone }]

  if (!Array.isArray(contacts)) {
    return res.status(400).json({ message: "contacts must be an array" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const normalized = contacts
      .filter((c) => c.phone) // Filter out contacts without phone numbers
      .map((c) => {
        const ct = c.contactType || "trusted";
        if (ct === "police") return { contactType: "police", name: "Police", phone: c.phone };
        return { contactType: "trusted", name: c.name || "Trusted Contact", phone: c.phone };
      });

    user.emergencyContacts = normalized;
    await user.save();

    res.status(200).json({ message: "Emergency contacts updated", emergencyContacts: user.emergencyContacts });
  } catch (error) {
    console.error("Error updating emergency contacts:", error);
    res.status(500).json({ message: "Error updating contacts", error: error.message });
  }
};
