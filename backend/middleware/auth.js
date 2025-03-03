import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check for the Authorization header
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];
        const refreshToken = req.body.refreshToken || req.query.refreshToken;

        // Create OAuth client
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        try {
            // Set credentials with the provided token
            oauth2Client.setCredentials({
                access_token: token,
                // Only add refresh token if it exists
                ...(refreshToken && { refresh_token: refreshToken })
            });
            
            // Test the token with a simple API call
            const drive = google.drive({ version: 'v3', auth: oauth2Client });
            await drive.about.get({ fields: 'user' });
            
            // If successful, attach the auth client to the request
            req.auth = oauth2Client;
            next();
        } catch (error) {
            // If token is expired and we have a refresh token, try to refresh
            if (error.message.includes('invalid_grant') && refreshToken) {
                try {
                    const { tokens } = await oauth2Client.refreshToken(refreshToken);
                    oauth2Client.setCredentials(tokens);
                    
                    // Attach fresh auth client and new token to the request
                    req.auth = oauth2Client;
                    req.newToken = tokens.access_token;
                    next();
                } catch (refreshError) {
                    return res.status(401).json({ 
                        error: 'Authentication failed', 
                        details: 'Failed to refresh token'
                    });
                }
            } else {
                return res.status(401).json({ 
                    error: 'Invalid token', 
                    details: error.message 
                });
            }
        }
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Authentication service error' });
    }
};

export default authenticateUser;