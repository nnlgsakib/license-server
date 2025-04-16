// expirationTemplate.ts

export function getExpirationSubject(): string {
  return 'Invoice Expiration Notice'
}

export function getExpirationText(billId: string): string {
  return `Dear Customer,
  
  We regret to inform you that your invoice with Bill ID ${billId} has expired. Please do not attempt to send any funds to this invoice, as doing so may result in your funds being compromised or lost.
  
  If you still wish to complete your transaction, please generate a new invoice.
  
  Thank you for your understanding.
  
  Best regards,
  W3PAY`
}

export function getExpirationHtml(billId: string): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>Invoice Expiration Notice</title>
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
              background-color: #ff4d4d;
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
              color: #ff4d4d;
              font-weight: bold;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h2>Invoice Expiration Notice</h2>
          </div>
          <div class="content">
              <p>Dear Customer,</p>
              <p>We regret to inform you that your invoice with Bill ID <span class="highlight">${billId}</span> has expired. Please do not attempt to send any funds to this invoice, as doing so may result in your funds being compromised or lost.</p>
              <p>If you still wish to complete your transaction, please generate a new invoice.</p>
              <p>Thank you for your understanding.</p>
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
