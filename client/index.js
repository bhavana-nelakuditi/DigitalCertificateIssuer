// Imports : You need to install these files using npm
const {
  EnclaveFactory
} = require('./enclave')
const {
  SawtoothClientFactory
} = require('./sawtooth-client')
const input = require('./input')
var express = require('express')
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({
  extended: false
})
const fs = require('fs')
var getKey = require("./keygen/keys")

keys = getKey.keys
login = {
  "user1": "hello",
  "user2": "hi"
}
var uname = "c"
var pwd = "b"
var user = "user1"


//Creating a transactor to connect the transaction Processor
const FAMILY_NAME = "cert_issuer"
const VERSION = "1.0"
const VALIDATOR = "http://192.168.99.100:8008"

const createTransactor = (PrivateKey) => {
  const enclave = EnclaveFactory(Buffer.from(keys[user]["PRIVATE_KEY"], 'hex'))

  const client = SawtoothClientFactory({
    enclave: enclave,
    restApiUrl: VALIDATOR
  })

  return client.newTransactor({
    familyName: FAMILY_NAME,
    familyVersion: VERSION
  })
}
//Transactor encode

//Express code
var app = express()
var server = app.listen(8081, function() {
  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)
})

app.get('/home', function(req, res) {
  res.sendFile(__dirname + "/html/" + "login.html");
})

app.post('/cert_gen', urlencodedParser, function(req, res) {
  uname = req.body.username
  pwd = req.body.password
  user = uname
  if (login[uname] == pwd) {
    res.sendFile(__dirname + "/html/" + "client.html");
  } else {
    res.end("WRONG CREDENTIALS")
  }
})

app.post('/return_response', urlencodedParser, async function(req, res) {
  try {
    payload = req.body.names + "," + req.body.id + "," + req.body.date
    console.log("Submitting the payload to input.js  " + payload)
    var resp = "Waiting"
    resp = await input.submitPayload(payload, createTransactor(null), user)
    console.log("Output is:" + (resp[1]))
    var cache = [];
    resp = JSON.stringify(resp[1], function(key, value) {
      if (typeof value === 'object' && value !== null) {
        if (cache.indexOf(value) !== -1) {
          // Duplicate reference found
          try {
            // If this value does not reference a parent it can be deduped
            return JSON.parse(JSON.stringify(value))
          } catch (error) {
            // discard key if value cannot be deduped
            return;
          }
        }
        // Store value in our collection
        cache.push(value);
      }
      return value;
    });
    cache = null;
    res.send('<h1 align="center" color="blue">Certificate generated successfully </h1><br><hr> <div tyle ="background-color:#c6e2bf;" align ="center"><h2>Transaction Id for the certificate generated is is: </h2> <p> ' + resp + '</p> <form action="http://127.0.0.1:8081/cert_gen" method="GET" align="center" > <input type="submit" value="Generate another certificate" style="width:25%; background-color: #4CAF50; color: white; padding: 14px 20px; margin: 8px 0; border: none; border-radius: 4px; cursor: pointer;"></form></div>')
    res.end()
    // res.sendFile( __dirname + "/" + "user1.txt"
  } catch (e) {
    console.log("e " + e)
  }
})

app.get('/cert_gen', function(req, res) {
  res.sendFile(__dirname + "/html/" + "client.html")
})

//Returning the list of transactions and linking them to the certificate
app.get('/return_transactions', function(req, res) {
  let user1 = user + ".txt"
  var data = fs.readFileSync(__dirname + "/" + user1, 'utf8');
  toString(data)
  var splitdata = data.split("\r\n")
  var newS = '<table style="background-color:#c6e2bf;" align="center"> <tr> <th><h2>No.</h2></th> <th><h2>Transaction</h2></th></tr>'
  for (i = 0; i < splitdata.length; i++) {
    var initi = i + 1
    initi = initi.toString() + ". "
    newS = "<tr>" + newS + "<td>" + initi + "</td>" +"<td>" + splitdata[i] + "</td>" + "</tr>"
  }

  newS = newS+ "</table>"

  res.send('<h1 align = "center"> Transaction Ids of all your previous certificates are </h1> <hr>' + newS + '<br> <hr>' + '<form action="http://127.0.0.1:8081/cert_gen" method="GET" align="center"> <input type="submit" value="Generate Certificate" style="width:25%; background-color: #4CAF50; color: white; padding: 14px 20px; margin: 8px 0; border: none; border-radius: 4px; cursor: pointer;"></form><hr> <form action="http://127.0.0.1:8081/cert_data" method="POST" align="center"><input type="text" name="txnid" style ="width: 25%; padding: 12px 20px; margin: 8px 0; display: inline-block; border: 1px  solid #ccc; border-radius: 4px; box-sizing: border-box;background-color: #C6E2BF"> : <input type="submit" value="View Certificate Details" style="width:25%; background-color: #4CAF50; color: white; padding: 14px 20px; margin: 8px 0; border: none; border-radius: 4px; cursor: pointer;"> </form>');
})

app.post('/cert_data', urlencodedParser, async function(req, res) {
  viewTxnId = req.body.txnid
  payload = "cert_view" + "," + viewTxnId
  // console.log("Submitting the payload to input.js  " + payload)
  // var resp = "Waiting"
  resp =  await input.submitPayload(payload)
  console.log(typeof resp)
  // res.send(resp['names'])
res.send(`<h1 style= "font-family: fantasy;font-display: fallback;" align= "center"> Details of the certificate </h1><br><hr><div align="center" style="border-radius: 5px; background-color: #c6e2bf; padding: 20px;"><h2> Transaction Id:</h2> <p>${viewTxnId}</p><br><table style="font-family: Arial; border: 1px solid #1C6EA4; background-color: #C6E2BF; width: 50%; text-align: center;"><tr style="background: #638AEA; border-bottom: 2px solid #444444;"><th>Attribute</th><th>Value</th></tr><tr><td>Names</td><td>${resp["names"]}</td></tr><tr><td>Id</td><td>${resp["id"]}</td></tr><tr><td>Dates</td><td>${resp["date"]}</td></tr></table></div><hr><form action="http://127.0.0.1:8081/return_transactions" method="GET" align="center"> <input type="submit" value="List of transactions" style="width:25%; background-color: #4CAF50; color: white; padding: 14px 20px; margin: 8px 0; border: none; border-radius: 4px; cursor: pointer;"></form><hr>`)

})
