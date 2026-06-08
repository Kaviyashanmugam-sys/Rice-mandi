// webhookRoutes.js — WhatsApp webhook
const express  = require("express");
const router   = express.Router();
const Customer = require("../models/Customer");
const { handleIncomingMessage } = require("../services/botService");
const logger   = require("../config/logger");

// GET — Meta verification
router.get("/", (req, res) => {
  const mode      = req.query["hub.mode"];
  const token     = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    logger.info("Webhook verified ✅");
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// POST — Incoming messages
router.post("/", async (req, res) => {
  res.sendStatus(200); // Always respond 200 first

  try {
    const value = req.body?.entry?.[0]?.changes?.[0]?.value;
    if (!value?.messages?.length) return;

    const msg  = value.messages[0];
    const from = msg.from;

    // WhatsApp Flow nfm_reply (checkout form submission)
    if (msg.type === "interactive" && msg.interactive?.type === "nfm_reply") {
      const responseJson = JSON.parse(msg.interactive.nfm_reply?.response_json || "{}");
      if (responseJson.customer_name) {
        const customer = await Customer.findOne({ whatsappPhone: from });
        if (customer) {
          const { handleCheckoutFlowResponse } = require("../services/botService");
          await handleCheckoutFlowResponse(customer, responseJson);
        }
        return;
      }
    }

    await handleIncomingMessage({
      id:          msg.id,
      from,
      type:        msg.type,
      text:        msg.text,
      interactive: msg.interactive,
      button:      msg.button,
      timestamp:   msg.timestamp,
    });
  } catch (err) {
    logger.error("Webhook error:", err);
  }
});

module.exports = router;
