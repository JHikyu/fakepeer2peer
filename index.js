const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

// Configure file upload middleware
app.use(fileUpload());

// Store uploaded files in memory
const uploadedFiles = {};

app.get('/files', (req, res) => {
  res.json({
    files: Object.keys(uploadedFiles).length
  });
});

// Handle file uploads
app.post('/upload/:id', (req, res) => {
  const fileId = req.params.id;
  
  // Check if a file is included in the request
  if (!req.files || !req.files.file) {
    return res.status(400).send('No file uploaded');
  }

  // Store the response object and upload timestamp for later use
  const uploadTime = Date.now();
  uploadedFiles[fileId] = {
    file: req.files.file,
    timestamp: uploadTime
  };
  console.log(`User uploaded file with ID: ${fileId}`);
  
  // Send a success response
  res.status(200).send(`http://5.249.161.81:1234/download/${fileId}`);

  // Schedule cleanup after one hour
  setTimeout(() => {
    if (fileId in uploadedFiles && uploadedFiles[fileId].timestamp === uploadTime) {
      delete uploadedFiles[fileId];
      console.log(`File with ID ${fileId} removed due to timeout`);
    }
  }, 60 * 60 * 1000); // 1 hour in milliseconds
});

// Handle file downloads
app.get('/download/:id', (req, res) => {
  const fileId = req.params.id;
  
  // Check if the file has been uploaded
  if (fileId in uploadedFiles) {
    const file = uploadedFiles[fileId].file;
    console.log(`User downloaded file with ID: ${fileId}`);
    
    // Send the file as a response
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    res.send(file.data);
    
    // Remove the entry from the uploadedFiles object
    // delete uploadedFiles[fileId];
  } else {
    res.status(404).send('File not found');
  }
});

// Start the server
app.listen(1234, () => {
  console.log('Server started on port 1234');
});
