const { createContext, CryptoFactory } = require('sawtooth-sdk/signing')
const fs = require('fs')
const path = require('path')
var getKey = require("./keys")
var login = require("./example")

// const env = require('./env')
const context = createContext('secp256k1')
const privateKey = context.newRandomPrivateKey()
const signer = new CryptoFactory(context).newSigner(privateKey)

// const output = `PRIVATE_KEY=${privateKey.asHex()}\nPUBLIC_KEY=${signer.getPublicKey().asHex()}\nREST_API_URL=http://localhost:8008`
// console.log("tpe " + typeof login.keys)
let newKeys = getKey.keys
var output = {}
var i=1
Object.keys(newKeys).forEach(function(key) {
  i=i+1
  output[key] = newKeys[key]
  })
entry = "user" + (i).toString()
output[entry] = {
  PRIVATE_KEY : privateKey.asHex(),
  PUBLIC_KEY : signer.getPublicKey().asHex()
}
op = "module.exports.keys = "
fs.writeFile(path.resolve(__dirname, './keys.js'), op,  function(err) {
    if (err) {
        return console.error(err);
    }
});
fs.writeFile(path.resolve(__dirname, './keys.js'), JSON.stringify(output),  {'flag':'a'},  function(err) {
    if (err) {
        return console.error(err);
    }
});
console.log(JSON.stringify(output))

// fs.writeFile(path.resolve(__dirname, './.env'), output, (err) => {
//   if (err) {
//     return console.log(err)
//   }
// })
//
// fs.writeFile(path.resolve(__dirname, './.env.example'), output,  {'flag':'a'},  function(err) {
//     if (err) {
//         return console.error(err);
//     }
// });

// console.log('\nGenerated .env file with public/private keys and REST API URL\n')
// console.log(output)
