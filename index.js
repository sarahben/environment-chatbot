'use strict';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const START_SEARCH_NO = 'START_SEARCH_NO';
const START_SEARCH_YES = 'START_SEARCH_YES';
const GREETING = 'GREETING';
const AUSTRALIA_YES = 'AUSTRALIA_YES';
const AU_LOC_PROVIDED = 'AU_LOC_PROVIDED';
const PREFERENCE_PROVIDED = 'PREFERENCE_PROVIDED';
const PREF_CLEANUP = 'PREF_CLEANUP';
const PREF_REVEGETATION = 'PREF_REVEGETATION';
const PREF_BIO_SURVEY = 'PREF_BIO_SURVEY';
const PREF_CANVASSING = 'PREF_CANVASSING';
const AUSTRALIA_NO = 'AUSTRALIA_NO';
const OTHER_HELP_YES = 'OTHER_HELP_YES';
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

// Connect with Dialogflow
const apiAiService = apiai(DIALOGFLOW_TOKEN, {
  language: "fr",
  requestSource: "fb"
});
const sessionIds = new Map();

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
              handlePostback(messagingEvent.sender.id, messagingEvent.message.quick_reply);
          } else {
            console.log( 'Webhook received unknown messagingEvent: ', messagingEvent );
          }
        });
      });
    }
});

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
//
function handleMessage(sender_psid, message) {
  // check if it is a location message
  console.log('handleMEssage message:', JSON.stringify(message));
  let response;
  if (message.text) {

    // Create the payload for a basic text message
    response = {
      "text": `You sent the message: "${message.text}". Now send me an image!`
    }
    callSendAPI(sender_psid, response);
  }
}



function handleOtherHelpPostback(sender_psid){
  const campaigns = {
    "attachment":{
       "type":"template",
       "payload":{
         "template_type":"generic",
         "elements":[
            {
             "title":"We need your help",
             "image_url":"http://awsassets.panda.org/img/original/wwf_infographic_tropical_deforestation.jpg",
             "subtitle":"to save our natural world",
             "buttons":[
               {
                 "type":"web_url",
                 "url":"https://donate.wwf.org.au/campaigns/rhinoappeal/",
                 "title":"Javan Rhino Appeal"
               },{
                 "type":"web_url",
                 "url":"https://donate.wwf.org.au/campaigns/donate/#AD",
                 "title":"Adopt an Animal"
               },{
                 "type":"web_url",
                 "url":"https://donate.wwf.org.au/campaigns/wildcards/",
                 "title":"Send a wildcard"
               }
             ]
           }
         ]
       }
     }
  };
  callSendAPI(sender_psid, campaigns);
}



function handlePostback(sender_psid, received_postback) {
  // Get the payload for the postback
  const payload = received_postback.payload;

  // Set the response and udpate db based on the postback payload
  switch (payload){
    case START_SEARCH_YES:
      updateStatus(sender_psid, payload, handleStartSearchYesPostback);
      break;
    case START_SEARCH_NO:
      updateStatus(sender_psid, payload, handleStartSearchNoPostback);
      break;
    case OTHER_HELP_YES:
      updateStatus(sender_psid, payload, handleOtherHelpPostback);
      break;
    case AUSTRALIA_YES:
      updateStatus(sender_psid, payload, handleAustraliaYesPostback);
      break;
    case AU_LOC_PROVIDED:
      updateStatus(sender_psid, payload, askForActivityPreference);
      break;
    case GREETING:
      updateStatus(sender_psid, payload, handleGreetingPostback);
      break;
    case PREF_CLEANUP:
    case PREF_REVEGETATION:
    case PREF_BIO_SURVEY:
    case PREF_CANVASSING:
      updatePreference(sender_psid, payload, handlePreferencePostback);
      break;
    default:
      console.log('Cannot differentiate the payload type');
  }
}

function callSendAPI(sender_psid, response) {
  // Construct the message body
  console.log('message to be sent: ', response);
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "url": `${FACEBOOK_GRAPH_API_BASE_URL}me/messages`,
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    console.log("Message Sent Response body:", body);
    if (err) {
      console.error("Unable to send message:", err);
    }
  });
}

function callGeocodingApi(address, sender_psid, callback){
  console.log('before calling geocoding api with address:', address);
  request({
    "url": `${GOOGLE_GEOCODING_API}${address}&key=${GOOGLE_GEOCODING_API_KEY}`,
    "method": "GET"
  }, (err, res, body) => {
    console.log('after calling geocoding api with result:', body);
    if (err) {
      console.error("Unable to retrieve location from Google API:", err);
    } else {
      const bodyObj = JSON.parse(body);
      if (bodyObj.status === 'OK'){
        if (bodyObj.results && bodyObj.results[0] && bodyObj.results[0].geometry && bodyObj.results[0].geometry.location){
          callback(sender_psid, bodyObj.results[0].geometry.location, bodyObj.results[0].formatted_address);
        }
      } else{
        console.error("Unable to retrieve location (status non-OK):", bodyObj);
      }
    }
  });
}
