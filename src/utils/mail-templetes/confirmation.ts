// template.ts

export function getSubject(): string {
  return 'Payment Confirmation'
}

export function getText(
  paidAmount: number,
  currency: string,
  billId: string,
  storeName: string
): string {
  return `Dear Customer,
          
  Your payment of ${paidAmount} ${currency} for bill ID ${billId} to store ${storeName} has been confirmed.
  
  Thank you for your purchase!
  
  Best regards,
  W3PAY`
}

export function getHtml(
  paidAmount: number,
  currency: string,
  billId: string,
  storeName: string
): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>Payment Confirmation</title>
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
              background-color: #4CAF50;
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
              color: #4CAF50;
              font-weight: bold;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h2>Payment Confirmation</h2>
          </div>
          <div class="content">
              <p>Dear Customer,</p>
              <p>Your payment of <span class="highlight">${paidAmount} ${currency}</span> for bill ID <span class="highlight">${billId}</span> to store <span class="highlight">${storeName}</span> has been confirmed.</p>
              <p>Thank you for your purchase!</p>
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
