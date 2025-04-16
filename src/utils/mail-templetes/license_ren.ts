export function getLicenseRenewalSubject(): string {
  return 'License Renewal Confirmation'
}

export function getLicenseRenewalText(licenseId: string, renewedUntil: string): string {
  return `Dear Customer,
            
    Your license with ID ${licenseId} has been successfully renewed. 
    It is now valid until ${renewedUntil}.
    
    Thank you for staying with us!
    
    Best regards,
    W3PAY`
}

export function getLicenseRenewalHtml(licenseId: string, renewedUntil: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>License Renewal Confirmation</title>
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
                <h2>License Renewal Confirmation</h2>
            </div>
            <div class="content">
                <p>Dear Customer,</p>
                <p>Your license with ID <span class="highlight">${licenseId}</span> has been successfully renewed. It is now valid until <span class="highlight">${renewedUntil}</span>.</p>
                <p>Thank you for staying with us!</p>
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
