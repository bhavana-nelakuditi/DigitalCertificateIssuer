const { createContext, CryptoFactory } = require('sawtooth-sdk/signing')
const fs = require('fs')
const path = require('path')

const env = require('./env')
const context = createContext('secp256k1')
const privateKey = context.newRandomPrivateKey()
const signer = new CryptoFactory(context).newSigner(privateKey)

const output = `PRIVATE_KEY=${privateKey.asHex()}\nPUBLIC_KEY=${signer.getPublicKey().asHex()}\nREST_API_URL=http://localhost:8008`

fs.writeFile(path.resolve(__dirname, './.env'), output, (err) => {
  if (err) {
    return console.log(err)
  }
})

fs.writeFile(path.resolve(__dirname, './.env.example'), output,  {'flag':'a'},  function(err) {
    if (err) {
        return console.error(err);
    }
});

console.log('\nGenerated .env file with public/private keys and REST API URL\n')
console.log(output, '\n')
