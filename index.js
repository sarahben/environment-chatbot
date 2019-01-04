'use strict';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const FACEBOOK_GRAPH_API_BASE_URL = 'https://graph.facebook.com/v2.6/';
const GOOGLE_GEOCODING_API = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
const MONGODB_URI = process.env.MONGODB_URI;
const GOOGLE_GEOCODING_API_KEY = process.env.GOOGLE_GEOCODING_API_KEY;
const DIALOGFLOW_TOKEN = process.env.API_AI_CLIENT_ACCESS_TOKEN;

const
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  apiai = require("apiai"),
  uuid = require("uuid"),
  axios = require('axios'),
  app = express().use(body_parser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

/*
 * GET
 *
 */
// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {

  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = process.env.VERIFICATION_TOKEN;

  // Parse params from the webhook verification request
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Check if a token and mode were sent
  if (mode && token) {

    // Check the mode and token sent are correct
    if (mode /*=== 'subscribe'*/ && token === VERIFY_TOKEN) {

      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});
// Connect with Dialogflow
const apiAiService = apiai(DIALOGFLOW_TOKEN, {
  language: "fr",
  requestSource: "fb"
});
const sessionIds = new Map();  //session DIALOGFLOW
/*
 * POST
 *
 */
// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {

  // Return a '200 OK' response to all events
  res.status(200).send('EVENT_RECEIVED');

  const body = req.body;

  if (body.object === 'page') {
      // Iterate over each entry
      // There may be multiple if batched
      if (body.entry && body.entry.length <= 0){
        return;
      }
      body.entry.forEach((pageEntry) => {
        // Iterate over each messaging event and handle accordingly
        pageEntry.messaging.forEach((messagingEvent) => {
          console.log({messagingEvent});
          if (messagingEvent.message) {
              handleMessage(messagingEvent);
          } else {
            console.log( 'Webhook received unknown messagingEvent: ', messagingEvent );
          }
        });
      });
    }
});

// fonction qui traite le message reçu
function handleMessage(event) {
  let senderID = event.sender.id;
  let recipientID = event.recipient.id;
  let timeOfMessage = event.timestamp;
  let message = event.message;

  if (!sessionIds.has(senderID)) {
    sessionIds.set(senderID, uuid.v1());
  }
  let messageId = message.mid;
  let appId = message.app_id;
  let metadata = message.metadata;

  // You may get a text or attachment but not both
  let messageText = message.text;
  let messageAttachments = message.attachments;

  if (messageText) {
    //send message to api.ai
    sendToApiAi(senderID, messageText);
  } else if (messageAttachments) {
    //handle the attachments
    handleMessageAttachments(messageAttachments, senderID);
  }
  // check if it is a locationletssage
  // console.log('handleMEssagletessage:', JSON.stringify(message));
  // let responlet
  // if (message.text) {
  //
  //   // Create the payload for a basic text message
  //   response = {
  //     "text": `You sent the message: "${message.text}". Now send me an image!`
  //   }
  //   callSendAPI(sender_psid, response);
  // }
}
// Dialogflow part
function sendToApiAi(sender, text) {
  //we will first call sendTypingOn() to show that bot is typing in Messenger.
  sendTypingOn(sender); // constant sendTypingOn is defined next
  // apiAiService is the constant defined for the Connection with Dialogflow
  let apiaiRequest = apiAiService.textRequest(text, {
    sessionId: sessionIds.get(sender)
  });

  apiaiRequest.on("response", response => {
    if (isDefined(response.result)) { //Constant isDefined is defined next
      handleApiAiResponse(sender, response);
    }
  });

  apiaiRequest.on("error", error => console.error(error));
  apiaiRequest.end();
}

/*
 * Constants
 *
 */

// isDefined
const isDefined = (obj) => {
  if (typeof obj == "undefined") {
    return false;
  }
  if (!obj) {
    return false;
  }
  return obj != null;
}
 // Turn typing indicator on
const sendTypingOn = (recipientId) => {
  let messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };
  callSendAPI(messageData);
}

function callSendAPI(messageData) {
// function callSendAPI(sender_psid, response) {
  // //Construct the message body
  // console.log('message to be sent: ', response);
  // let request_body = {
  //   "recipient": {
  //     "id": sender_psid
  //   },
  //   "message": response
  // }

  // Send the HTTP request to the Messenger Platform
  request({
    "url": `${FACEBOOK_GRAPH_API_BASE_URL}me/messages`,
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json" : messageData
    // "json": request_body
  }, (err, res, body) => {
    console.log("Message Sent Response body:", body);
    if (err) {
      console.error("Unable to send message:", err);
    }
  });
}
