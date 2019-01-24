'use strict'
const {
  TransactionHandler
} = require('sawtooth-sdk/processor/handler')
// const cbor = require('cbor')
const crypto = require('crypto')
// const {
//   decodeData
// } = require('./node_modules/request/lib/helpers')
const {
  InternalError,
  InvalidTransaction
} = require('sawtooth-sdk/processor/exceptions')
const {
  TextEncoder,
  TextDecoder
} = require('text-encoding/lib/encoding')
var encoder = new TextEncoder('utf8')
var decoder = new TextDecoder('utf8')
const _hash = (x) =>
  crypto.createHash('sha512').update(x).digest('hex').toLowerCase().substring(0, 64)

const FAMILY_NAME = 'cert_issuer'
const VERSION = '1.0'
const NAMESPACE = _hash(FAMILY_NAME).substr(0, 6)

const _decodeRequest = (payload) =>
  new Promise((resolve, reject) => {
    // payload = decoder.decode(payload)
    payload = payload.toString().split(',')
    // console.log('Payload' + JSON.stringify(payload))
    // console.log('This is the payload after decryption' + payload)
    if (payload) {
      resolve({
        names: payload[0],
        id: payload[1],
        date: payload[2]
      })
    } else {
      let reason = new InvalidTransaction('Invalid payload serialization')
      reject(reason)
    }
  })

const _toInternalError = (err) => {
  console.log('in error message block')
  let message = err.message ? err.message : err
  throw new InternalError(message)
}

const createCert = (context, address, cert_data, txnid) => (possibleAddressValues) => {
  let stateValueRep = possibleAddressValues[address]
  let newData = {}
  let data

  newData[txnid] = cert_data
  var flag = 0
  if (stateValueRep == null || stateValueRep == '') {
    console.log('Creating your first certificate')
    console.log(newData)
  } else {
    data = decoder.decode(stateValueRep)
    data = JSON.parse(data)
    // console.log("Data " + data)
    Object.keys(data).forEach(function(key) {
        if (JSON.stringify(data[key]) === JSON.stringify(cert_data)) {
          console.log("This certificate is already generated and will not be generated again")
          flag = 1
        }
      })

  if(flag==0){
  data[txnid] = cert_data
  // delete data[txnid]
  }
  newData = data
  // console.log('All your certificates: ' + JSON.stringify(newData))
  console.log("Your certificate is added to your namespace")
}

  return _setEntry(context, address, newData)
}


const _setEntry = (context, address, stateValue) => {
  let entries = {
    [address]: encoder.encode(JSON.stringify(stateValue))
  }
  return context.setState(entries)
}

class cert_issuer extends TransactionHandler {
  constructor() {
    super(FAMILY_NAME, [VERSION], NAMESPACE)
  }

  apply(transactionRequest, context) {
    return _decodeRequest(transactionRequest.payload)
      .catch(_toInternalError)
      .then((update) => {
        console.log('Transaction is processing')

        let header = transactionRequest.header
        let userPublicKey = header.signerPublicKey
        let txnid = transactionRequest.signature
        // console.log(txnid)


        let cert_data = {
          names: update.names,
          id: update.id,
          date: update.date
        }

        if (!update.names) {
          throw new InvalidTransaction('There is no name')
        }

        let actionFn = createCert
        let senderAddress = NAMESPACE + _hash(userPublicKey).slice(-64)

        let getPromise = context.getState([senderAddress])
        // Apply the action to the promise's result:
        let actionPromise = getPromise.then(
          // console.log("Calling the function")
          actionFn(context, senderAddress, cert_data, txnid)
        )

        // Validate that the action promise results in the correctly set address:
        // return
         return actionPromise.then(addresses => {
          if (addresses.length === 0) {
            throw new InternalError('State Error!')
          }
          // console.log('Certificate is created')
          console.log(`Certificate is at the address: ${JSON.stringify(addresses)}`)
        })
      })
  }
}
module.exports = cert_issuer

//changed cert_issuer and input.js
