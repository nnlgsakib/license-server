const EC = require('elliptic').ec;
const crypto = require('crypto');
const axios = require('axios');

const ec = new EC('secp256k1');

// Replace this with the private key you provide (in hex format)
const privateKey = 'c76e176bde72270fbba50ee372e489269cde6a7caf77e550af82b4512730f72e'; // Must match the whitelisted public key

// Base URL of the license server
const baseUrl = 'http://localhost:3001';

// Function to sign a message with the private key
async function signMessage(privKey, message) {
  const key = ec.keyFromPrivate(privKey, 'hex');
  const hash = crypto.createHash('sha256').update(message).digest();
  const signature = key.sign(hash);
  return JSON.stringify({
    r: signature.r.toString(16),
    s: signature.s.toString(16),
    recoveryParam: signature.recoveryParam,
  });
}

// Main test function
async function testLicenseServer() {
  try {
    // Step 1: Generate a license
    console.log('Testing /license/generate...');
    let message = Date.now().toString();
    let signature = await signMessage(privateKey, message);
    console.log("signature:", signature);
    const generateResponse = await axios.post(`${baseUrl}/license/generate`, {
      message,
      signature,
      email: 'test@example.com',
      months: 1,
    });
    console.log('Generate License Response:', generateResponse.data);
    const { license, userKey } = generateResponse.data; // Assuming response includes these fields

    // Step 2: Verify the license
    console.log('\nTesting /license/verify...');
    message = Date.now().toString();
    signature = await signMessage(privateKey, message);
    const verifyResponse = await axios.post(`${baseUrl}/license/verify`, {
      message,
      signature,
      license,
      userKey,
    });
    console.log('Verify License Response:', verifyResponse.data);

    // Step 3: Get license details
    console.log('\nTesting /license/details...');
    message = Date.now().toString();
    signature = await signMessage(privateKey, message);
    const detailsResponse = await axios.post(`${baseUrl}/license/details`, {
      message,
      signature,
      license,
      userKey,
    });
    console.log('License Details Response:', detailsResponse.data);

    // Step 4: Renew the license
    console.log('\nTesting /license/renew...');
    message = Date.now().toString();
    signature = await signMessage(privateKey, message);
    const renewResponse = await axios.post(`${baseUrl}/license/renew`, {
      message,
      signature,
      license,
      userKey,
      months: 1,
    });
    console.log('Renew License Response:', renewResponse.data);

    // Step 5: Block the license
    console.log('\nTesting /license/block...');
    message = Date.now().toString();
    signature = await signMessage(privateKey, message);
    const blockResponse = await axios.post(`${baseUrl}/license/block`, {
      message,
      signature,
      license,
    });
    console.log('Block License Response:', blockResponse.data);

    // Step 6: Unblock the license
    console.log('\nTesting /license/unblock...');
    message = Date.now().toString();
    signature = await signMessage(privateKey, message);
    const unblockResponse = await axios.post(`${baseUrl}/license/unblock`, {
      message,
      signature,
      license,
    });
    console.log('Unblock License Response:', unblockResponse.data);

  } catch (error) {
    console.error('Error during test:', error.response ? error.response.data : error.message);
  }
}

// Run the test
testLicenseServer();