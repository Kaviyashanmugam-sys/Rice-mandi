// whatsappService.js — WhatsApp Cloud API wrappers
const axios  = require("axios");
const fs     = require("fs");
const path   = require("path");
const { messagesUrl, headers, phoneNumberId } = require("../config/whatsapp");
const logger = require("../config/logger");

async function send(payload) {
  try {
    const res = await axios.post(messagesUrl, payload, { headers });
    return res.data;
  } catch (err) {
    logger.error("WA API error:", err.response?.data || err.message);
    throw err;
  }
}

async function sendTextMessage(to, body) {
  return send({ messaging_product:"whatsapp", to, type:"text", text:{ body, preview_url:false } });
}

async function sendButtonMessage(to, body, buttons) {
  return send({
    messaging_product:"whatsapp", to, type:"interactive",
    interactive:{
      type:"button", body:{ text: body },
      action:{
        buttons: buttons.slice(0,3).map((b,i) => ({
          type:"reply", reply:{ id:`BTN_${i}_${b.replace(/\W/g,"_").toUpperCase().slice(0,24)}`, title: b.slice(0,20) }
        }))
      }
    }
  });
}

async function sendListMessage(to, body, buttonText, sections) {
  return send({
    messaging_product:"whatsapp", to, type:"interactive",
    interactive:{
      type:"list", body:{ text: body },
      action:{ button: buttonText || "Select", sections }
    }
  });
}

async function sendImageMessage(to, imageUrl, caption) {
  return send({ messaging_product:"whatsapp", to, type:"image", image:{ link: imageUrl, caption: caption || "" } });
}

// Send a document (PDF invoice)
async function sendDocumentMessage(to, documentUrl, filename, caption) {
  return send({
    messaging_product:"whatsapp", to, type:"document",
    document:{ link: documentUrl, filename, caption: caption || "" }
  });
}

async function sendFlowMessage(to, body, flowId, flowToken, cta) {
  return send({
    messaging_product:"whatsapp", to, type:"interactive",
    interactive:{
      type:"flow", body:{ text: body },
      action:{
        name:"flow",
        parameters:{
          flow_message_version:"3",
          flow_token: flowToken,
          flow_id:    flowId,
          flow_cta:   cta || "Open Form",
          flow_action:"navigate",
          flow_action_payload:{ screen:"CHECKOUT" }
        }
      }
    }
  });
}

async function sendTemplateMessage(to, templateName, langCode="en", components=[]) {
  return send({
    messaging_product:"whatsapp", to, type:"template",
    template:{ name: templateName, language:{ code: langCode }, components }
  });
}

async function markAsRead(messageId) {
  return send({ messaging_product:"whatsapp", status:"read", message_id: messageId });
}

module.exports = {
  sendTextMessage, sendButtonMessage, sendListMessage,
  sendImageMessage, sendDocumentMessage, sendFlowMessage,
  sendTemplateMessage, markAsRead
};
