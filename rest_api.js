var fs = require("fs");
var http = require("http");

var tmp_json = {};
var g_last = 0;
var data = {};
var result ;
var test_result;
 //request 1
var req1 = new Promise((resolve, reject) => {
  http.get('http://trackbag.royalairmaroc.com/site/bag-status?tag=AT707351&flightdate=09JAN&name=soukouna', (resp) => {
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

//  //request 2
// var req2 = new Promise((resolve, reject) => {
//   http.get('server2:api', (resp) => {
//     let data = '';
//
//     resp.on('data', (chunk) => {
//       data += chunk;
//     });
//
//     resp.on('end', () => {
//       tmp_json.server2 = {};
//       tmp_json.server2 = JSON.parse(data);
//       g_last = tmp_json.height; // 256
//       console.log(g_last); // 256
//       resolve()
//     });
//
//   }).on("error", (err) => {
//     console.log("Error: " + err.message);
//     reject(error)
//   });
// });

Promise.all([ req1 ]).then(() => {
  console.log(result, "test3");
  data = JSON.stringify(result);
  test_result = result;
  fs.writeFile('./data_test.json', data, 'utf8');
})

console.log(test_result, "testfinal");
