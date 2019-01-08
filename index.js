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

// Define global variable for message type
  let message_type;
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
  let sender = event.sender;
  let recipientID = event.recipient.id;
  let message = event.message;

  if (!sessionIds.has(sender.id)) {
    sessionIds.set(sender.id, uuid.v1());
  }

  // You may get a text or attachment but not both
  let messageText = message.text;
  let messagePostback = message.postback;

  if (messageText) {
    //send message to api.ai
    message_type = messageText;
    sendToApiAi(sender, messageText);
  } else if (messageAttachments) {
    //handle postbacks
    message_type = messagePostback;
    sendToApiAi(sender, messagePostback);
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
  sendTypingOn(sender.id); // constant sendTypingOn is defined next
  // apiAiService is the constant defined for the Connection with Dialogflow
  let apiaiRequest = apiAiService.textRequest(text, {
    sessionId: sessionIds.get(sender.id)
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
const sendTypingOn = (recipientID) => {
  let messageData = {
    recipient: {
      id: recipientID
    },
    sender_action: "typing_on"
  };
  callSendAPI(messageData);
}

//Send that data to the handleApiAiResponse()
function handleApiAiResponse(sender, response) {
  let responseText = response.result.fulfillment.speech;
  let responseData = response.result.fulfillment.data;
  let messages = response.result.fulfillment.messages;
  let action = response.result.action;
  let contexts = response.result.contexts;
  let parameters = response.result.parameters;

  // Stop the typing
  sendTypingOff(sender.id);
  if (responseText == "" && !isDefined(action)) {
    //api ai could not evaluate input.
    console.log("Unknown query" + response.result.resolvedQuery);
    sendTextMessage(
      sender.id,
      "I'm not sure what you want. Can you be more specific?" );
  } else if (isDefined(action)) {
    handleApiAiAction(sender, action, responseText, contexts, parameters); // A définir
  } else if (isDefined(responseData) && isDefined(responseData.facebook)) {
    try {
      console.log("Response as formatted message" + responseData.facebook);
      sendTextMessage(sender, responseData.facebook);
    } catch (err) {
      sendTextMessage(sender, err.message);
    }
  } else if (isDefined(responseText)) {
    sendTextMessage(sender, responseText);
  }
}
/*
 * Constants
 *
 */
 //Turn typing indicator off
const sendTypingOff = (recipientID) => {
  var messageData = {
    recipient: {
      id: recipientID
    },
    sender_action: "typing_off"
  };

  callSendAPI(messageData);
}
//Whenever we get unknown query from user we have to send Default message to that user.
const sendTextMessage = async (recipientId, text) => {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: text
    }
  };
  await callSendAPI(messageData);
}
// If we get Action from dialogflow response, we are calling the handleApiAiAction().
function handleApiAiAction(sender, action, responseText, contexts, parameters) {
   switch (action) {
    case "send-text":
      // var responseText = "This is example of Text message."
      var responseText = "Hello ".concat(sender.last_name, " here is a text.");
      sendTextMessage(sender.id, responseText);
      break;
      case "send-image": //"https://ibb.co/KzrjDsz";
      var imgUrl = "https://cdn1.imggmi.com/uploads/2019/1/7/87f7342840d56d0e67c2a0f01a250c7c-full.jpg";
      sendImageMessage(sender.id, imgUrl);
      break;
      case "send-quick-reply":
      var responseText = "Que cherchez-vous?"
      var replies = [{
        "content_type": "text",
        "title": "Checking",
        "payload": "Checking",
    },
    {
        "content_type": "text",
        "title": "Track bagage",
        "payload": "Track bagage",
    },
    {
        "content_type": "text",
        "title": "Flight status",
        "payload": "Flight status",
    }];
    sendQuickReply(sender.id, responseText, replies)
    break;
    default:
      //unhandled action, just send back the text
    sendTextMessage(sender.id, responseText);
  }
}

const sendImageMessage = async (recipientId, imageUrl) => {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: imageUrl
        }
      }
    }
  };
    await callSendAPI(messageData);
}

const sendQuickReply = async (recipientId, text, replies, metadata) => {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: text,
      metadata: isDefined(metadata) ? metadata : "",
      quick_replies: replies
    }
  };
  await callSendAPI(messageData);
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
