require('dotenv').config();
const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (your HTML)
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve your HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post("/send-quote", async (req, res) => {
  const { name, contact, email, productDetails, message } = req.body;

  // Validation
  if (!name || !email) {
    return res.status(400).json({ 
      success: false, 
      error: "Name and email are required fields" 
    });
  }

  try {
    // Setup transporter
    const transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify transporter
    await transporter.verify();

    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      replyTo: email,
      subject: `New Quote Request from ${name}`,
      html: `
        <h2>New Quote Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Contact:</strong> ${contact || 'Not provided'}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Product Details:</strong> ${productDetails || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${message || 'No message provided'}</p>
        <hr>
        <p><em>This email was sent from the iTorrent Metal contact form.</em></p>
      `,
      text: `
        New Quote Request

        Name: ${name}
        Contact: ${contact || 'Not provided'}
        Email: ${email}
        Product Details: ${productDetails || 'Not provided'}
        Message: ${message || 'No message provided'}

        This email was sent from the iTorrent Metal contact form.
      `,
    };

    await transporter.sendMail(mailOptions);
    
    res.json({ 
      success: true, 
      message: "Quote request sent successfully!" 
    });
    
  } catch (error) {
    console.error("Mail sending error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to send email. Please try again later." 
    });
  }
});

// Export Express app for Vercel
module.exports = app;

module.exports = app;