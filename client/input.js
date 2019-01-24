const fs = require('fs')
const path = require('path')

const input = {
  submitPayload: async (payload, transactor, user) => {
    const txn = payload
    var user1 = user

    try {
      const showCert = require('./viewCert')
      let payload_check = payload.toString().split(',')

      if (payload_check[0] == "cert_view") {
        gen_cert = await showCert.datas
        console.log(gen_cert[payload_check[1]])
        return gen_cert[payload_check[1]]
        //write code for viewing certificate
      }

      else {
        // console.log(payload)
        console.log(`Submitting transaction to Sawtooth REST API`)

        // Wait for the response from the validator receiving the transaction
        const txnRes = await transactor.post(txn)

        if (!txnRes) {
          console.log('No Response')
        } else if (!txnRes[1]) {
          console.log('No transaction id')
        }

        user1 = user1 + '.txt'
        fs.writeFile(path.resolve(__dirname, './', user1), txnRes[1] + '\r\n', {
          'flag': 'a'
        },

        function(err) {
          if (err) {
            return console.error(err)
          }
        })

        // Log only a few key items from the response, because it's a lot of info
        console.log({
          status: txnRes[0].status,
          statusText: txnRes[0].statusText
        })

        return txnRes
      }

    } catch (err) {
      console.log('Error submitting transaction to Sawtooth REST API: ', err)
      console.log('Transaction: ', txn)
    }
  }
}
module.exports = input
