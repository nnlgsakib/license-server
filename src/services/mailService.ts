// mailService.ts
import nodemailer from 'nodemailer'
import {config} from '../config/config'
import {
  getLicenseHtml,
  getLicenseSubject,
  getLicenseText,
  getLicenseExpiredSubject,
  getLicenseExpiredText,
  getLicenseExpiredHtml,
  getLicenseWarningSubject,
  getLicenseWarningText,
  getLicenseWarningHtml,
} from './../utils/mail-templetes'
import logger from '../utils/logger'
import {
  getLicenseRenewalHtml,
  getLicenseRenewalSubject,
  getLicenseRenewalText,
} from '../utils/mail-templetes/license_ren'

// Configure the transporter for your Postfix server with authentication
const transporter = nodemailer.createTransport({
  host: config.mail_host,
  port: config.mail_port,
  secure: true,
  auth: {
    user: config.mail,
    pass: config.mail_password,
  },
  tls: {
    rejectUnauthorized: true,
  },
})



export async function sendLicenseMail(
  to: string,
  license: string,
  userKey: string,
  valid_till: string
): Promise<void> {
  try {
    const subject = getLicenseSubject()
    const text = getLicenseText(license, userKey, valid_till)
    const html = getLicenseHtml(license, userKey, valid_till)

    await transporter.sendMail({
      from: '"Web3Pay" <no_reply@web3twenty.com>',
      to: to,
      subject: subject,
      text: text,
      html: html,
    })
    logger.info('Sent license creation mail to : ' + to)
  } catch (error) {
    console.error('Error sending license email:', error)
  }
}

export async function sendLicenseWarningMail(
  to: string,
  licenseId: string,
  remainingDays: number
): Promise<void> {
  try {
    const subject = getLicenseWarningSubject()
    const text = getLicenseWarningText(licenseId, remainingDays)
    const html = getLicenseWarningHtml(licenseId, remainingDays)

    await transporter.sendMail({
      from: '"Web3Pay" <no_reply@web3twenty.com>',
      to: to,
      subject: subject,
      text: text,
      html: html,
    })
  } catch (error) {
    console.error('Error sending license warning email:', error)
  }
}

// New function to send an email when the license has fully expired
export async function sendLicenseExpiredMail(to: string, licenseId: string): Promise<void> {
  try {
    const subject = getLicenseExpiredSubject()
    const text = getLicenseExpiredText(licenseId)
    const html = getLicenseExpiredHtml(licenseId)

    await transporter.sendMail({
      from: '"Web3Pay" <no_reply@web3twenty.com>',
      to: to,
      subject: subject,
      text: text,
      html: html,
    })
  } catch (error) {
    console.error('Error sending license expired email:', error)
  }
}

export async function sendLicenseRenewalMail(
  to: string,
  licenseId: string,
  renewedUntil: string
): Promise<void> {
  try {
    const subject = getLicenseRenewalSubject()
    const text = getLicenseRenewalText(licenseId, renewedUntil)
    const html = getLicenseRenewalHtml(licenseId, renewedUntil)

    await transporter.sendMail({
      from: '"Web3Pay" <no_reply@web3twenty.com>',
      to: to,
      subject: subject,
      text: text,
      html: html,
    })

    logger.info(`License renewal email sent to ${to} for license ${licenseId}.`)
  } catch (error) {
    console.error('Error sending license renewal email:', error)
  }
}
