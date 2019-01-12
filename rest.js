// var Client = require('node-rest-client').Client;
// //
// // // direct way
// // var client = new Client();
// //
// // var args = {
// // 	path: { "tag": "AT707351", "flightdate": "09JAN", "name": "soukouna" },
// // 	headers: { "test-header": "client-api" }
// // };
// // // http://trackbag.royalairmaroc.com/site/bag-status?tag=$tag&flightdate=$flightdate&name=$name
// // client.get("http://trackbag.royalairmaroc.com/site/bag-status?tag={tag}&flightdate=${flightdate}&&name=${name}", args,
// // 	function (data, response) {
// // 		// parsed response body as js object
// // 		console.log(data);
// // 		// raw response
// // 		// console.log(response);
// // 	});
// var client = new Client();
//
// // request and response additional configuration
// var args = {
// 	path: { "id": 120 },
// 	parameters: { arg1: "hello", arg2: "world" },
// 	headers: { "test-header": "client-api" },
// 	data: "<xml><arg1>hello</arg1><arg2>world</arg2></xml>",
// 	requestConfig: {
// 		timeout: 1000, //request timeout in milliseconds
// 		noDelay: true, //Enable/disable the Nagle algorithm
// 		keepAlive: true, //Enable/disable keep-alive functionalityidle socket.
// 		keepAliveDelay: 1000 //and optionally set the initial delay before the first keepalive probe is sent
// 	},
// 	responseConfig: {
// 		timeout: 1000 //response timeout
// 	}
// };
// http://trackbag.royalairmaroc.com/site/bag-status?tag=AT707351&flightdate=09JAN&name=soukouna
//
// client.post("http://remote.site/rest/xml/${id}/method", args, function (data, response) {
// 	// parsed response body as js object
// 	console.log(data);
// 	// raw response
// 	console.log(response);
// });

var http = require('http');

var options = {
  host: 'trackbag.royalairmaroc.com',
  port: 80,
  path : '/site/bag-status?tag=AT707351&flightdate=09JAN&name=soukouna',
  method : 'GET'
};

http.request(options, function(res){
    var body = '';

    res.on('data', function (chunk) {
      body += chunk;
        });
    res.on('end', function () {
      var result = JSON.parse(body);
      console.log(result.statut);
    });
}).end();
