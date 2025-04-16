export function getFailedPaymentSubject(): string {
  return 'Payment Failure Notification'
}

export function getFailedPaymentText(
  billId: string,
  desiredAmount: string,
  paidAmount: string
): string {
  return `Dear Customer,
    
    Unfortunately, your payment attempt for the invoice with Bill ID ${billId} has failed. The amount you paid (${paidAmount}) was less than the required amount (${desiredAmount}).
  
    Please note that this payment is non-refundable. If you wish to complete the transaction, please generate a new invoice and ensure the correct amount is paid.
  
    We apologize for any inconvenience caused.
  
    Best regards,
    W3PAY`
}

export function getFailedPaymentHtml(
  billId: string,
  desiredAmount: string,
  paidAmount: string
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Payment Failure Notification</title>
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
                <h2>Payment Failure Notification</h2>
            </div>
            <div class="content">
                <p>Dear Customer,</p>
                <p>Unfortunately, your payment attempt for the invoice with Bill ID <span class="highlight">${billId}</span> has failed. The amount you paid (<span class="highlight">${paidAmount}</span>) was less than the required amount (<span class="highlight">${desiredAmount}</span>).</p>
                <p><strong>Important:</strong> This payment is non-refundable. Please generate a new invoice and ensure the correct amount is paid to complete your transaction.</p>
                <p>We apologize for any inconvenience caused.</p>
                <p>Thank you for choosing W3PAY.</p>
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
