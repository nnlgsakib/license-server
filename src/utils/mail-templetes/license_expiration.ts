export function getLicenseWarningSubject(): string {
  return 'License Expiration Warning'
}

export function getLicenseWarningText(licenseId: string, remainingDays: number): string {
  return `Dear Customer,
  
  Your license (ID: ${licenseId}) is about to expire. Only ${remainingDays} day(s) remain (approximately 5% of the total license period).
  
  Please consider renewing your license promptly to avoid service interruption.
  
  Best regards,
  W3PAY`
}

export function getLicenseWarningHtml(licenseId: string, remainingDays: number): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>License Expiration Warning</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
        }
        .container {
          width: 100%;
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border: 1px solid #eaeaea;
          border-radius: 5px;
          padding: 20px;
        }
        .header {
          background-color: #FFA500;
          color: #ffffff;
          padding: 15px;
          text-align: center;
          border-top-left-radius: 5px;
          border-top-right-radius: 5px;
        }
        .content {
          padding: 20px;
          line-height: 1.6;
        }
        .footer {
          font-size: 12px;
          color: #777;
          text-align: center;
          padding-top: 10px;
          border-top: 1px solid #eaeaea;
          margin-top: 20px;
        }
        .highlight {
          color: #FFA500;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>License Expiration Warning</h2>
        </div>
        <div class="content">
          <p>Dear Customer,</p>
          <p>Your license (ID: <span class="highlight">${licenseId}</span>) is nearing its expiration. Only about <span class="highlight">${remainingDays} day(s)</span> remain (approximately 5% of the license period).</p>
          <p>Please consider renewing your license as soon as possible to avoid any service interruptions.</p>
          <p>Best regards,</p>
          <p>W3PAY</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} W3PAY. All rights reserved.</p>
          <p>If you have any questions, please contact us at support@w3pay.com.</p>
        </div>
      </div>
    </body>
    </html>`
}

export function getLicenseExpiredSubject(): string {
  return 'Your License Has Expired'
}

export function getLicenseExpiredText(licenseId: string): string {
  return `Dear Customer,
  
  Your license (ID: ${licenseId}) has expired. Please renew your license to restore access and services.
  
  If you have any questions, feel free to contact our support team.
  
  Best regards,
  W3PAY`
}

export function getLicenseExpiredHtml(licenseId: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>License Expired</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
        }
        .container {
          width: 100%;
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border: 1px solid #eaeaea;
          border-radius: 5px;
          padding: 20px;
        }
        .header {
          background-color: #B22222;
          color: #ffffff;
          padding: 15px;
          text-align: center;
          border-top-left-radius: 5px;
          border-top-right-radius: 5px;
        }
        .content {
          padding: 20px;
          line-height: 1.6;
        }
        .footer {
          font-size: 12px;
          color: #777;
          text-align: center;
          padding-top: 10px;
          border-top: 1px solid #eaeaea;
          margin-top: 20px;
        }
        .highlight {
          color: #B22222;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>License Expired</h2>
        </div>
        <div class="content">
          <p>Dear Customer,</p>
          <p>Your license (ID: <span class="highlight">${licenseId}</span>) has expired.</p>
          <p>Please renew your license to restore access and services. If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,</p>
          <p>W3PAY</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} W3PAY. All rights reserved.</p>
          <p>If you have any questions, please contact us at support@w3pay.com.</p>
        </div>
      </div>
    </body>
    </html>`
}
