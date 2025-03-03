import express from 'express';
import { listUserSpreadsheets, fetchSheetData, createSpreadsheet } from '../controllers/sheetController.js';
import authenticateUser from '../middleware/auth.js'; // Import the authentication middleware

const router = express.Router();

// Protect all routes with the authenticateUser middleware
router.use(authenticateUser);

// Get all spreadsheets for the user
router.get('/spreadsheets', listUserSpreadsheets);

// Get data from a specific spreadsheet
router.get('/data/:spreadsheetId', fetchSheetData);

// Create a new spreadsheet
router.post('/spreadsheets',authenticateUser, createSpreadsheet);

export default router;