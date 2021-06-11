require('dotenv').config();

module.exports = {
  ocrKey: process.env.OCR_API_KEY || '',
  ocrSecret: process.env.OCR_API_SECRET || '',
  ocrDomain: process.env.OCR_DOMAIN || '',
};
