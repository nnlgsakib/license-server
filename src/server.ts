// src/server.ts

import express, { Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'
import { ec as EC } from 'elliptic'
import crypto from 'crypto'
import winston from 'winston'
import cron from 'node-cron'
import {
  generateLicense,
  renewLicense,
  verifyLicense,
  getLicenseDetails,
  blockLicense,
  unblockLicense,
  monitorLicenses,
} from './services/licenseService'
import { asyncHandler } from './utils/async_handler'
import { addPublicKey, isPublicKeyWhitelisted } from './storage/license_db'

const ec = new EC('secp256k1')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [new winston.transports.Console()],
})

// Initialize default public keys
const DEFAULT_PUBLIC_KEYS = [
  '04a6987754f167c0f44ef33b8fbd0d3a5729785db128a8d98809bfa3e874ede2b5b5e36ecdd93c6adf075173245b50b9734206cde8ccfe8b51612d7f121cacf059',
  '04da2d4397a0ed65b5513dbccb5ea82b3c13596df84b3e99b57100b7c91bd54589d58e4fcf62738fca7494d631a7f425b9139b707c09e8565f2bb7601232dc122a',
  '04da54239c9a68ca01d1762d375eaa9870ff72d8449280d010a00eea4be9da8618c2d4e3cfea282d7ca1de25be4203457fb07da0aaeaf81c6a3766da629d71fa37',
]

async function initializePublicKeys() {
  try {
    for (const pubKey of DEFAULT_PUBLIC_KEYS) {
      if (!(await isPublicKeyWhitelisted(pubKey))) {
        await addPublicKey(pubKey)
        logger.info(`Initialized default public key: ${pubKey}`)
      }
    }
  } catch (error) {
    logger.error(`Failed to initialize public keys: ${error}`)
    throw error
  }
}

function authenticateRequest(req: Request, res: Response, next: NextFunction) {
  if (req.path === '/gen_key_set' || req.path === '/health') {
    next()
    return
  }

  const { message, signature } = req.body

  if (!message || !signature) {
    logger.warn('Missing message or signature in request')
    res.status(401).json({ error: 'Missing message or signature' })
    return
  }

  try {
    const hash = crypto.createHash('sha256').update(message).digest()
    const sig = JSON.parse(signature)
    const recoveredKey = ec.recoverPubKey(hash, sig, sig.recoveryParam, 'hex')
    const pubKeyHex = recoveredKey.encode('hex')

    isPublicKeyWhitelisted(pubKeyHex)
      .then((isWhitelisted) => {
        if (!isWhitelisted) {
          logger.warn(`Unauthorized access attempt from pubKey: ${pubKeyHex}`)
          res.status(403).json({ error: 'Unauthorized public key' })
          return
        }

        const key = ec.keyFromPublic(pubKeyHex, 'hex')
        const isValid = key.verify(hash, sig)

        if (!isValid) {
          logger.warn(`Invalid signature from pubKey: ${pubKeyHex}`)
          res.status(403).json({ error: 'Invalid signature' })
          return
        }

        logger.info(`Authorized request from pubKey: ${pubKeyHex}`)
        next()
      })
      .catch((error) => {
        logger.error(`Database error during authentication: ${error}`)
        res.status(500).json({ error: 'Authentication failed' })
      })
  } catch (error) {
    logger.error(`Authentication error: ${error}`)
    res.status(500).json({ error: 'Authentication failed' })
  }
}

const app = express()
const PORT = process.env.PORT || 3005 // Match logs

app.use(bodyParser.json())
app.use(authenticateRequest)

app.use((req, _, next) => {
  logger.info(`Incoming ${req.method} request to ${req.originalUrl} | Body: ${JSON.stringify(req.body)}`)
  next()
})

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' })
})

app.post('/gen_key_set', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const keyPair = ec.genKeyPair()
    const publicKey = keyPair.getPublic('hex')
    const privateKey = keyPair.getPrivate('hex')

    await addPublicKey(publicKey)
    logger.info(`New key pair generated and public key stored: ${publicKey}`)

    res.json({
      publicKey,
      privateKey,
      message: 'Key pair generated successfully. Store the private key securely.',
    })
  } catch (error) {
    logger.error(`Key generation error: ${error}`)
    res.status(500).json({ error: 'Failed to generate key pair' })
  }
}))

app.post('/license/generate', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, months } = req.body

  if (!email) {
    res.status(400).json({ error: 'Email is required' })
    return
  }

  const result = await generateLicense(email, months)
  res.json(result)
}))

app.post('/license/renew', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { license, userKey, months } = req.body

  if (!license || !userKey) {
    res.status(400).json({ error: 'License and userKey required' })
    return
  }

  const result = await renewLicense(license, userKey, months)
  res.json(result)
}))

app.post('/license/verify', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { license, userKey } = req.body

  if (!license || !userKey) {
    res.status(400).json({ error: 'License and userKey required' })
    return
  }

  const result = await verifyLicense(license, userKey)
  res.json(result)
}))

app.post('/license/details', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { license, userKey } = req.body

  if (!license || !userKey) {
    res.status(400).json({ error: 'License and userKey required' })
    return
  }

  const details = await getLicenseDetails(license, userKey)
  if (details) {
    res.json(details)
  } else {
    res.status(404).json({ error: 'License not found or access denied' })
  }
}))

app.post('/license/block', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { license } = req.body

  if (!license) {
    res.status(400).json({ error: 'License is required' })
    return
  }

  const success = await blockLicense(license)
  res.json({ success })
}))

app.post('/license/unblock', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { license } = req.body

  if (!license) {
    res.status(400).json({ error: 'License is required' })
    return
  }

  const success = await unblockLicense(license)
  res.json({ success })
}))

function runCrons() {
  cron.schedule('0 * * * *', () => {
    logger.info('license monitoring service started')
    monitorLicenses().catch((error) => {
      logger.error('License monitoring job failed:', error)
    })
  })
}

async function startServer() {
  try {
    await initializePublicKeys()
    runCrons()
    app.listen(PORT, () => {
      logger.info(`🚀 License microservice running at http://localhost:${PORT}`)
    })
  } catch (error) {
    logger.error(`Failed to start server: ${error}`)
    process.exit(1)
  }
}

startServer()