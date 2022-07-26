//import the methods
const { generateKeyPair, createSign, createVerify } = require('crypto')
const fs = require('fs')
const path = require('path')
//generate the key pair
generateKeyPair(
  'rsa',
  {
    modulusLength: 2048, // It holds a number. It is the key size in bits and is applicable for RSA, and DSA algorithm only.
    publicKeyEncoding: {
      type: 'pkcs1', //Note the type is pkcs1 not spki
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs1', //Note again the type is set to pkcs1
      format: 'pem'
      //cipher: "aes-256-cbc", //Optional
      //passphrase: "", //Optional
    }
  },
  (err, publicKey, privateKey) => {
    // Handle errors and use the generated key pair.
    if (err) console.log('Error!', err)
    console.log({
      publicKey,
      privateKey
    }) //Print the keys to the console or save them to a file.

    fs.writeFileSync(path.join(__dirname, 'publicKey.pem'), publicKey, 'utf-8')
    fs.writeFileSync(
      path.join(__dirname, 'privateKey.pem'),
      privateKey,
      'utf-8'
    )
    /*
     * At this point you will have to pem files,
     * the public key which will start with
     * '-----BEGIN RSA PUBLIC KEY-----\n' +
     * and the private key which will start with
     * '-----BEGIN RSA PRIVATE KEY-----\n' +
     */
    //Verify it works by signing some data and verifying it.
    //Create some sample data that we want to sign
    const verifiableData = 'this need to be verified'

    // The signature method takes the data we want to sign, the
    // hashing algorithm, and the padding scheme, and generates
    // a signature in the form of bytes
    const signature = require('crypto').sign(
      'sha256',
      Buffer.from(verifiableData),
      {
        key: privateKey,
        padding: require('crypto').constants.RSA_PKCS1_PSS_PADDING
      }
    )
    //Convert the signature to base64 for storage.
    console.log(signature.toString('base64'))

    // To verify the data, we provide the same hashing algorithm and
    // padding scheme we provided to generate the signature, along
    // with the signature itself, the data that we want to
    // verify against the signature, and the public key
    const isVerified = require('crypto').verify(
      'sha256',
      Buffer.from(verifiableData),
      {
        key: publicKey,
        padding: require('crypto').constants.RSA_PKCS1_PSS_PADDING
      },
      Buffer.from(signature.toString('base64'), 'base64')
    )

    // isVerified should be `true` if the signature is valid
    console.log('signature verified: ', isVerified)
  }
)
