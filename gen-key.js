const fs = require('fs')
const { ec: EC } = require('elliptic')

// Initialize elliptic curve
const ec = new EC('secp256k1')

// Generate a new key pair
const keyPair = ec.genKeyPair()

// Get private and public key in hex format
const privateKey = keyPair.getPrivate('hex')
const publicKey = keyPair.getPublic('hex')

// Print to console
console.log('✅ Key Pair Generated:')
console.log('Private Key:', privateKey)
console.log('Public Key :', publicKey)

// Optional: Save to file
const output = {
  privateKey,
  publicKey,
}

fs.writeFileSync('ecdsa-keys.json', JSON.stringify(output, null, 2))
console.log('\n📝 Keys saved to ecdsa-keys.json')
