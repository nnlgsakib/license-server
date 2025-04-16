// src/index.ts

import express, { Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'
import { ec as EC } from 'elliptic'
import crypto from 'crypto'
import winston from 'winston'
import {
  generateLicense,
  renewLicense,
  verifyLicense,
  getLicenseDetails,
  blockLicense,
  unblockLicense,
} from './services/licenseService'
import { asyncHandler } from './utils/async_handler'

const ec = new EC('secp256k1')

const WHITELISTED_PUBLIC_KEYS = new Set<string>([
    '04da2d4397a0ed65b5513dbccb5ea82b3c13596df84b3e99b57100b7c91bd54589d58e4fcf62738fca7494d631a7f425b9139b707c09e8565f2bb7601232dc122a'
])

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [new winston.transports.Console()],
})

function authenticateRequest(req: Request, res: Response, next: NextFunction) {
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

    if (!WHITELISTED_PUBLIC_KEYS.has(pubKeyHex)) {
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
  } catch (error) {
    logger.error(`Authentication error: ${error}`)
    res.status(500).json({ error: 'Authentication failed' })
  }
}

const app = express()
const PORT = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(authenticateRequest)

app.use((req, _, next) => {
  logger.info(`Incoming ${req.method} request to ${req.originalUrl} | Body: ${JSON.stringify(req.body)}`)
  next()
})

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

app.listen(PORT, () => {
  logger.info(`🚀 License microservice running at http://localhost:${PORT}`)
})
