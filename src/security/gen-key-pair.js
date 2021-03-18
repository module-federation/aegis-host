
// Node.js program to demonstrate the 
// crypto.generateKeyPair() method 
  
// Including generateKeyPair from crypto module 
const { generateKeyPair } = require('crypto'); 
  
// Calling generateKeyPair() method 
// with its parameters 
generateKeyPair('rsa', { 
  modulusLength: 530,    // options 
  publicExponent: 0x10101, 
  publicKeyEncoding: { 
    type: 'pkcs1', 
    format: 'der'
  }, 
  privateKeyEncoding: { 
    type: 'pkcs8', 
    format: 'der', 
    cipher: 'aes-192-cbc', 
    passphrase: 'GeeksforGeeks is a CS-Portal!'
  } 
}, (err, publicKey, privateKey) => { // Callback function 
       if(!err) 
       { 
         // Prints new asymmetric key pair 
         console.log("Public Key is : ", publicKey); 
         console.log(); 
         console.log("Private Key is: ", privateKey); 
       } 
       else
       { 
         // Prints error 
         console.log("Errr is: ", err); 
       } 
         
  }); 