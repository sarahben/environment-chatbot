// var fs = require("fs");
// var http = require("http");
//
// var tmp_json = {};
// var g_last = 0;
// var data = {};
// var result ;
// var test_result;
//  //request 1
// var req1 = new Promise((resolve, reject) => {
//   http.get('http://trackbag.royalairmaroc.com/site/bag-status?tag=AT707351&flightdate=09JAN&name=soukouna', (resp) => {
//     let data = '';
//
//     resp.on('data', (chunk) => {
//       data += chunk;
//     });
//
//     resp.on('end', () => {
//       tmp_json.server1 = {};
//       tmp_json.server1 = JSON.parse(data);
//       result = JSON.parse(data);
//       console.log(result.statut, "test1");
//       resolve()
//     });
//
//   }).on("error", (err) => {
//     console.log("Error: " + err.message, "testError");
//     reject(error)
//   });
// });
var text = "AT707351 09JAN"
var res = text.split(" ");
var tag = res[0];
var date_bag = res[1];
var name_bag = res[2];
if(tag == null || date_bag == null || name_bag == null){
  console.log("it is")
}
console.log(tag, "++++++++++++");
console.log(date_bag, "--------------");
console.log(name_bag, "*************");
//  //request 2
var path_bag = 'http://trackbag.royalairmaroc.com/site/bag-status?tag=AT707351&flightdate=09JAN&name=soukouna';
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
  if(result.onward != null){
    //"onward":null,"onwardFlight":null,"onwardDate":nul
    full_result = full_result + "Destination finale : " + String(result.onward) + "\n" +
                                "Num vol de correspondance : " + String(result.onwardFlight) + "\n" +
                                "Date vol de correspondance : " + String(result.onwardDate) + "\n";
  console.log(full_result, "testAPI_onward");
  };
});
