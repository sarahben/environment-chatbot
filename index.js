'use strict';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const FACEBOOK_GRAPH_API_BASE_URL = 'https://graph.facebook.com/v2.6/';
const GOOGLE_GEOCODING_API = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
const MONGODB_URI = process.env.MONGODB_URI;
const GOOGLE_GEOCODING_API_KEY = process.env.GOOGLE_GEOCODING_API_KEY;
const DIALOGFLOW_TOKEN = process.env.API_AI_CLIENT_ACCESS_TOKEN; //"4d5ad866b6ff4daabad7f93d8c76e517";//

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
  let resultSoap;
  let tag_bag;
  let flight_date;
  let name;
  let variable_texte;
  let res_bag;
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
    // you need permission for most of these fields
    const userFieldSet = 'id, name, about, email';
    const options = {
    method: 'GET', // "url": `${FACEBOOK_GRAPH_API_BASE_URL}me
    url: `${FACEBOOK_GRAPH_API_BASE_URL}${req.params.id}`,
    qs: {
      access_token: PAGE_ACCESS_TOKEN,
      fields: userFieldSet
    }
  }; //end const options
  request(options)
    .then(fbRes => {
      res.json(fbRes);
    })
    console.log(fbRes.name);
    username = fbRes.name;
  } //endif
}); //fin app.get

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
//Post for the fullfilments in DIalogflow /ai
  app.post('/ai', (req, res) => {

    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

    const body = req.body;
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
    // let flight_number = body.responses[0].parameters['flight-number'];
    // let text = "you sent "+ flight_number ;

    console.log(body);

    // sendTextMessage(recipientId, text);
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
    message_type = "text";
    sendToApiAi(sender, messageText);
  } else if (messagePostback) {
    //handle postbacks
    message_type = "postback";
    sendToApiAi(sender, messagePostback);
  }
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
      handleApiAiResponse(sender, response, text);
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
function handleApiAiResponse(sender, response, text) {
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
    handleApiAiAction(sender, action, responseText, contexts, parameters, text); // A définir
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
  console.log(messageData);
  await callSendAPI(messageData);
}
//If we get Action from dialogflow response, we are calling the handleApiAiAction().
function handleApiAiAction(sender, action, responseText, contexts, parameters, text) {
   switch (action) {
    case "input.unknown":
        var responseText = responseText + " Comment pourrions-nous vous aider?"
        // sendTextMessage(sender.id, responseText);
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
      case "send-image": //"https://ibb.co/KzrjDsz";
        var imgUrl = "https://cdn1.imggmi.com/uploads/2019/1/7/87f7342840d56d0e67c2a0f01a250c7c-full.jpg";
        sendImageMessage(sender.id, imgUrl);
        break;
        //welcome intent in both languages
      case "welcome-intent-fr":
        var replies = [{
          "content_type": "text",
          "title": "Checking",
          "payload": "Checking",
      },
      {
          "content_type": "text",
          "title": "Suivi bagage",
          "payload": "Suivi bagage",
      },
      {
          "content_type": "text",
          "title": "Staut de vol",
          "payload": "Statut de vol",
      }];
        sendQuickReply(sender.id, responseText, replies)
        break;
        case "welcome-intent-en":
          var replies = [{
            "content_type": "text",
            "title": "Checking",
            "payload": "Checking",
        },
        {
            "content_type": "text",
            "title": "Track luggage",
            "payload": "Track luggage",
        },
        {
            "content_type": "text",
            "title": "Flight status",
            "payload": "Flight status",
        }];
          sendQuickReply(sender.id, responseText, replies)
          break;
    // Call webservice RAM track bagage
    case "Track_luggage":
      sendTextMessage(sender.id, responseText);
      break;
    case "Suivi_bagage":
      sendTextMessage(sender.id, responseText);
      break;
    case "tag-lug":
    // Variables de path
      var res = text.split(" ");
      var tag = res[0];
      var date_bag = res[1];
      var name_bag = res[2];
      console.log(text);
      console.log(tag, date_bag, name_bag, "Karim");
      //Chemin de rest
      var path_bag = 'http://trackbag.royalairmaroc.com/site/bag-status?tag=' + tag + '&flightdate=' + date_bag + '&name=' + name_bag;
      console.log(path_bag, "Baydara");
      // web service REST
      var http = require('http');
      var fs = require("fs");
      var tmp_json = {};
      var g_last = 0;
      var data = {};
      var result ;
      var full_result;
       //request 1
      var req1 = new Promise((resolve, reject) => {
        http.get(path_bag, (resp) => {
          let data = '';

          resp.on('data', (chunk) => {
            data += chunk;
          });

          resp.on('end', () => {
            tmp_json.server1 = {};
            tmp_json.server1 = JSON.parse(data);
            result = JSON.parse(data);
            console.log(result.statut, "test1");
            resolve()
          });

        }).on("error", (err) => {
          console.log("Error: " + err.message, "testError");
          reject(error)
        });
      });
      Promise.all([ req1 ]).then(() => {
        console.log(result, "test3");
        data = JSON.stringify(result);
        full_result = "Statut : " + String(result.statut) + "\n" +
                      "Aeroport : " + String(result.airport) + "\n" +
                      "Destination : " + String(result.destination) + "\n" +
                      "Vol : " + String(result.vol) + "\n" +
                      "Date du vol : " + String(result.date) + "\n" ;
        console.log(full_result, "testAPI_send");
        if(result.onward){
          //"onward":null,"onwardFlight":null,"onwardDate":nul
          full_result = full_result + "Destination finale : " + String(result.onward) + "\n" +
                                      "Num vol de correspondance : " + String(result.onwardFlight) + "\n" +
                                      "Date vol de correspondance : " + String(result.onwardDate) + "\n";
        console.log(full_result, "testAPI_onward");
        };
        sendTextMessage(sender.id, full_result);
        // sendTextMessage(sender.id, result.statut);
        fs.writeFile('./data_test.json', data, 'utf8');
      })
      break;
    // Call webservice RAM flight status
    case "Flight_status":
      sendTextMessage(sender.id, responseText);
      break;
    case "Statut_vol":
        sendTextMessage(sender.id, responseText);
        break;
    case "Flight-number":
      // sendFlightnumber(sender.id, responseText, parameters);
      var body_xml = parameters.flight.replace(/\s+/g, '');
      var requestBody =
        '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" ' +
        'xmlns:ws="http://ws.royalairmaroc.com"> <soapenv:Header/>' +
        '<soapenv:Body> <ws:SmsgetFlightInfoByFlightNumber>' +
        '<ws:FlightNumber>' + body_xml + '</ws:FlightNumber>' +
        '</ws:SmsgetFlightInfoByFlightNumber>' +
        '</soapenv:Body>' +
        '</soapenv:Envelope>';

      var requestHeaders = {
        'cache-control': 'no-cache',
        'soapaction': 'urn:SmsgetFlightInfoByFlightNumber',
        'content-type': 'text/xml;charset=UTF-8'
      };

      var requestOptions = {
        'method': 'POST',
        'url': 'http://statutvolp.royalairmaroc.com/WebServiceStatutDeVol/services/FlightStatus?wsdl',
        'qs': { 'wsdl': ''},
        'proxy': 'http://38tzc6v3ms43ku:rT4elgo_oPu3fsO3sUhusgt_uQ@eu-west-static-01.quotaguard.com:9293',
        'headers': requestHeaders,
        'body': requestBody,
        'timeout': 5000
      };

      request(requestOptions, function (error, response, body) {
        if (error) {
          console.log(error);
        } else {
      //Afficher resultat
      // console.log(body);
        var DOMParser = new (require('xmldom')).DOMParser;
        var doc = DOMParser.parseFromString(body);
        //Statut
        var NodeById = doc.getElementsByTagName('ax21:statut')[0];
            var var_1 = NodeById.childNodes[0];
            var statut_vol = var_1.nodeValue;
            // console.log
      //Num Vol
        var NodeByvol = doc.getElementsByTagName('ax21:flightNumber')[0];
            var var_2 = NodeByvol.childNodes[0];
            var num_vol = var_2.nodeValue;
      //Date vol
        var NodeBydate = doc.getElementsByTagName('ax21:flightDate')[0];
            var var_3 = NodeBydate.childNodes[0];
            var date_vol = var_3.nodeValue;
      //destination
        var NodeBydestin = doc.getElementsByTagName('ax21:destination')[0];
            var var_4 = NodeBydestin.childNodes[0];
            var date_destin = var_4.nodeValue;
      //date et heure d'arrivée.
        var NodeBytime = doc.getElementsByTagName('ax21:schedueldArrival')[0];
            var var_5 = NodeBytime.childNodes[0];
            var time_arr = var_5.nodeValue;

            // variable_texte = String(statut_vol + num_vol + date_vol + date_destin + time_arr);
            variable_texte = "Statut : " + String(statut_vol) + "\n" +
                             "Num de vol : " + String(num_vol) + "\n" +
                             "Date du vol : " + String(date_vol) + "\n" +
                             "Destination : " + String(date_destin) + "\n" +
                             "Date et heure d arrivee : " + String(time_arr) + "\n" ;
            // String(var_2);
            console.log(variable_texte, "sara");
         }
      });
      // ----- WAIT -------
      // wait((5000)); home
      // console.log(sender.id, variable_texte);
      // function callback(error, response, body) {
      //     if (!error && response.statusCode == 200) {
      //         console.log(body);
      //     }
      // }
      // request(requestOptions, callback);
      // console.log(variable_texte, "out");
      sendTextMessage(sender.id, variable_texte);
 //      //Send responses
 //      send(sender.id, responseText);
 //
 //      const send = async (recipientId, responseText) => {
 //      var messageData = {
 //        recipient: {
 //          id: recipientId
 //        },
 //        message: {
 //          text: responseText
 //        }
 //      };
 //      await callSendAPI(messageData);
 // }

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
// Fontion dans laquelle est géré le traitement de la récupération du flight number
function sendFlightnumber(recipientId, responseText, parameters){
  let func_body;
  let flight_number = parameters.flight.replace(/\s+/g, '');
  var requestBody =
    '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" ' +
    'xmlns:ws="http://ws.royalairmaroc.com"> <soapenv:Header/>' +
    '<soapenv:Body> <ws:SmsgetFlightInfoByFlightNumber>' +
    '<ws:FlightNumber>' + flight_number +'</ws:FlightNumber>' +
    '</ws:SmsgetFlightInfoByFlightNumber>' +
    '</soapenv:Body>' +
    '</soapenv:Envelope>';

  var requestHeaders = {
    'cache-control': 'no-cache',
    'soapaction': 'urn:SmsgetFlightInfoByFlightNumber',
    'content-type': 'text/xml;charset=UTF-8'
  };

  var requestOptions = {
    'method': 'POST',
    'url': 'http://statutvolp.royalairmaroc.com/WebServiceStatutDeVol/services/FlightStatus?wsdl',
    'qs': { 'wsdl': ''},
    'proxy': 'http://38tzc6v3ms43ku:rT4elgo_oPu3fsO3sUhusgt_uQ@eu-west-static-01.quotaguard.com:9293',
    'headers': requestHeaders,
    'body': requestBody,
    'timeout': 5000
  };
  request(requestOptions, function (error, response, body) {
    if (error) {
      console.log(error);
      func_body = "error";
    } else {
      //Afficher resultat
      // console.log(body);
        var DOMParser = new (require('xmldom')).DOMParser;
        var doc = DOMParser.parseFromString(body);
        var NodeById = doc.getElementsByTagName('ax21:statut')[0];
        var var_1 = NodeById.childNodes[0];
        var var_2 = var_1.nodeValue;
        // console.log(z);
        responseText = String(var_2);
     }
  });
  // console.log(requestBody);
  sendTextMessage(recipientId, responseText);
}
// Send API de FACEBOOK
// L'API reçoit un input JSON qu'elle envoie à messenger
function callSendAPI(messageData) {
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
