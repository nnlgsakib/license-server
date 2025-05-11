const axios = require('axios');
const { ec: EC } = require('elliptic');
const crypto = require('crypto');

const ec = new EC('secp256k1');
const BASE_URL = 'http://localhost:3005';

// Helper function to sign a message with a private key
function signMessage(message, privateKey) {
  const key = ec.keyFromPrivate(privateKey, 'hex');
  const hash = crypto.createHash('sha256').update(message).digest();
  const signature = key.sign(hash);
  return {
    r: signature.r.toString('hex'),
    s: signature.s.toString('hex'),
    recoveryParam: signature.recoveryParam,
  };
}

// Helper function to make authenticated requests
async function makeAuthenticatedRequest(endpoint, data, privateKey) {
  const message = JSON.stringify(data);
  const signature = signMessage(message, privateKey);
  try {
    const response = await axios.post(`${BASE_URL}${endpoint}`, {
      ...data,
      message,
      signature: JSON.stringify(signature),
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error in ${endpoint}: ${error.response?.data?.error || error.message}`);
  }
}

// Test all API endpoints
async function testApis() {
  let publicKey, privateKey, licenseKey, userKey;

  console.log('Starting API tests...\n');

  // 1. Test /health endpoint
  try {
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('Health Check:', healthResponse.data);
  } catch (error) {
    console.error('Health Check failed:', error.message);
  }

  // 2. Test /gen_key_set endpoint
  try {
    const keyResponse = await axios.post(`${BASE_URL}/gen_key_set`);
    publicKey = keyResponse.data.publicKey;
    privateKey = keyResponse.data.privateKey;
    console.log('Generated  Generate Key Set:', keyResponse.data);
  } catch (error) {
    console.error('Generate Key Set failed:', error.message);
    return;
  }

  // 3. Test /license/generate endpoint
  try {
    const generateData = { email: 'test@example.com', months: 12 };
    const generateResponse = await makeAuthenticatedRequest('/license/generate', generateData, privateKey);
    licenseKey = generateResponse.license;
    userKey = generateResponse.userKey;
    console.log('Generate License:', generateResponse);
  } catch (error) {
    console.error('Generate License failed:', error.message);
    return;
  }

  // 4. Test /license/verify endpoint
  try {
    const verifyData = { license: licenseKey, userKey };
    const verifyResponse = await makeAuthenticatedRequest('/license/verify', verifyData, privateKey);
    console.log('Verify License:', verifyResponse);
  } catch (error) {
    console.error('Verify License failed:', error.message);
  }

  // 5. Test /license/details endpoint
  try {
    const detailsData = { license: licenseKey, userKey };
    const detailsResponse = await makeAuthenticatedRequest('/license/details', detailsData, privateKey);
    console.log('License Details:', detailsResponse);
  } catch (error) {
    console.error('License Details failed:', error.message);
  }

  // 6. Test /license/renew endpoint
  try {
    const renewData = { license: licenseKey, userKey, months: 6 };
    const renewResponse = await makeAuthenticatedRequest('/license/renew', renewData, privateKey);
    console.log('Renew License:', renewResponse);
  } catch (error) {
    console.error('Renew License failed:', error.message);
  }

  // 7. Test /license/block endpoint
  try {
    const blockData = { license: licenseKey };
    const blockResponse = await makeAuthenticatedRequest('/license/block', blockData, privateKey);
    console.log('Block License:', blockResponse);
  } catch (error) {
    console.error('Block License failed:', error.message);
  }

  // 8. Test /license/unblock endpoint
  try {
    const unblockData = { license: licenseKey };
    const unblockResponse = await makeAuthenticatedRequest('/license/unblock', unblockData, privateKey);
    console.log('Unblock License:', unblockResponse);
  } catch (error) {
    console.error('Unblock License failed:', error.message);
  }

  console.log('\nAPI tests completed.');
}

// Run the tests
testApis().catch((error) => {
  console.error('Test suite failed:', error.message);
});