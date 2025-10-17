const nodemailer = require("nodemailer");

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM
} = process.env;

// Create reusable transporter
let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Send patient credentials via email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.patientName - Patient's full name
 * @param {string} options.username - Login username (mobile number)
 * @param {string} options.password - Generated password
 * @param {string} options.cardNumber - Health card number
 */
async function sendPatientCredentials({ to, patientName, username, password, cardNumber }) {
  try {
    const transporter = getTransporter();
    
    const mailOptions = {
      from: SMTP_FROM || SMTP_USER,
      to,
      subject: "Welcome to Smart Healthcare System - Your Account Details",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #7e957a; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Smart Healthcare System</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #2d3b2b;">Welcome, ${patientName}!</h2>
            
            <p>Your patient account has been successfully created. Below are your login credentials:</p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Username:</strong> ${username}</p>
              <p style="margin: 10px 0;"><strong>Password:</strong> <span style="color: #7e957a; font-size: 18px; font-weight: bold;">${password}</span></p>
              <p style="margin: 10px 0;"><strong>Health Card Number:</strong> ${cardNumber}</p>
            </div>
            
            <p style="color: #d9534f; font-weight: bold;">⚠️ Please keep these credentials secure and change your password after first login.</p>
            
            <p>You can now log in to access your health records, view appointments, and download your digital health card with QR code.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
                 style="background-color: #7e957a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Login Now
              </a>
            </div>
            
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
              If you did not register for this account, please contact our support team immediately.
            </p>
          </div>
          
          <div style="background-color: #2d3b2b; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Smart Healthcare System. All rights reserved.</p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`✅ Credentials email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    // Don't throw error, just log it - registration should still succeed
    return false;
  }
}

/**
 * Send staff credentials via email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.staffName - Staff's full name
 * @param {string} options.username - Login username
 * @param {string} options.password - Generated password
 * @param {string} options.position - Staff position
 */
async function sendStaffCredentials({ to, staffName, username, password, position }) {
  try {
    const transporter = getTransporter();
    
    const mailOptions = {
      from: SMTP_FROM || SMTP_USER,
      to,
      subject: "Welcome to Smart Healthcare System - Staff Account Created",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #7e957a; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Smart Healthcare System</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Staff Portal Access</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #2d3b2b;">Welcome, ${staffName}!</h2>
            
            <p>Your staff account has been successfully created by the administrator. Below are your login credentials:</p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7e957a;">
              <p style="margin: 10px 0;"><strong>Position:</strong> ${position}</p>
              <p style="margin: 10px 0;"><strong>Username:</strong> ${username}</p>
              <p style="margin: 10px 0;"><strong>Password:</strong> <span style="color: #7e957a; font-size: 20px; font-weight: bold; letter-spacing: 2px;">${password}</span></p>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>⚠️ Important Security Notice:</strong><br>
                • Please change your password immediately after first login<br>
                • Never share your credentials with anyone<br>
                • Keep your login details secure
              </p>
            </div>
            
            <p>As a staff member, you can:</p>
            <ul style="color: #2d3b2b;">
              <li>Register new patients</li>
              <li>Generate digital health cards</li>
              <li>Manage patient records</li>
              <li>View and print health cards</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
                 style="background-color: #7e957a; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Login to Staff Portal
              </a>
            </div>
            
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
              If you have any questions or need assistance, please contact the system administrator.
            </p>
          </div>
          
          <div style="background-color: #2d3b2b; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Smart Healthcare System. All rights reserved.</p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`✅ Staff credentials email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    return false;
  }
}

module.exports = { sendPatientCredentials, sendStaffCredentials };

