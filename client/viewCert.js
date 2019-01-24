const fetch = require('node-fetch')
const { TextDecoder } = require('text-encoding/lib/encoding')

var decoder = new TextDecoder('utf8')
var geturl = 'http://192.168.99.100:8008/state/d75b43268a04ab1cabcf8fe381f0fe3b86eced1c4478d092008b47e788616f771d9e16'
// console.log("Getting from: " + geturl);
module.exports.datas = fetch(geturl, {
    method: 'GET',
  })
  .then((response) => response.json())
  .then((responseJson) => {
    var data = responseJson.data;
    var amount = Buffer.from(data, 'base64').toString();
    decoder.decode(amount)
    amount = JSON.parse(amount)
    amount1 = amount
    return amount1;
  })
  .catch((error) => {
    console.error(error);
  });
