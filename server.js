const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');

const app = express();
const port = 3000;

// Set up Multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('aadhaarImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Process the image with Tesseract.js
        const imagePath = req.file.path;
        const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');

        // Extract Name and Aadhaar Number from OCR text
        const nameMatch = text.match(/Name\s*:\s*(.*)/i);
        const aadhaarMatch = text.match(/\d{4}\s\d{4}\s\d{4}/);

        const name = nameMatch ? nameMatch[1].trim() : 'Name not found';
        const aadhaarNumber = aadhaarMatch ? aadhaarMatch[0].replace(/\s+/g, '') : 'Aadhaar number not found';

        // Return the extracted information as JSON
        res.json({ name, aadhaarNumber });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: 'Failed to process the image' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
