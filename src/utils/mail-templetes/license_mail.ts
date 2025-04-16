export function getLicenseSubject(): string {
  return 'Your Web3Pay License and User Key'
}

export function getLicenseText(license: string, userKey: string, expiretion: string): string {
  return `Dear Customer,
  
  We are pleased to provide you with your new Web3Pay license and user key. Please find the details below:
  
  License: ${license}
  User Key: ${userKey}
  valid till : ${expiretion}
  Keep this information safe as it will be required for future validations and renewals.
  
  Thank you for choosing Web3Pay!
  
  Best regards,
  W3PAY`
}

export function getLicenseHtml(license: string, userKey: string, valid_till: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Your Web3Pay License and User Key</title>
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
                <h2>Your Web3Pay License and User Key</h2>
            </div>
            <div class="content">
                <p>Dear Customer,</p>
                <p>We are pleased to provide you with your new Web3Pay license and user key. Please find the details below:</p>
                <p><strong>License:</strong> <span class="highlight">${license}</span></p>
                <p><strong>User Key:</strong> <span class="highlight">${userKey}</span></p>
                <p><strong>Expiretion:</strong> <span class="highlight">${valid_till}</span></p>
                <p>Keep this information safe as it will be required for future validations and renewals.</p>
                <p>Thank you for choosing Web3Pay!</p>
                <p>Best regards,<br>W3PAY</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} W3PAY. All rights reserved.</p>
                <p>If you have any questions, please contact us at support@w3pay.com.</p>
            </div>
        </div>
    </body>
    </html>
    `
}
