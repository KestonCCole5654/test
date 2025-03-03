import express, { json } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { google } from 'googleapis';
import sheetsRouter from './routes/sheetRoutes.js';
import authRouter from './middleware/auth.js';

// Load environment variables
config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
app.use(
  cors({
    origin: 'http://localhost:3000', // Allow requests from this origin
    credentials: true, // Allow credentials (cookies, authorization headers)
  })
);

// Middleware to parse JSON request bodies
app.use(json());

// Create a new OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Route to start the OAuth flow
app.get('/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Request a refresh token
    prompt: 'consent', // Force Google to show the consent screen
    scope: ['https://www.googleapis.com/auth/spreadsheets'], // Required scopes
  });
  res.redirect(authUrl);
});


app.get('/auth/google/callback', async (req, res) => {
 

  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);

     
    console.log("Got tokens:", {
      access_token: tokens.access_token ? "present" : "missing",
      refresh_token: tokens.refresh_token ? "present" : "missing",
      expiry_date: tokens.expiry_date
    });

    
    // Redirect the user to the frontend with both tokens
    res.redirect(
      `http://localhost:3000?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`
    );
  } catch (error) {
    console.error('Error during OAuth callback:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google' });
  }
});


// Set up routes
app.use('/api', sheetsRouter);
app.use('/auth', authRouter);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'SheetBills API is running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

