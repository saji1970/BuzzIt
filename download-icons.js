const fs = require('fs');
const path = require('path');
const https = require('https');

// Create a simple colored square PNG using a web service
const createIconFromWeb = async (filename) => {
  return new Promise((resolve, reject) => {
    // Use a simple web service to create a colored square
    const url = `https://via.placeholder.com/1024x1024/E4405F/FFFFFF?text=🐱🔥`;
    
    https.get(url, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        fs.writeFileSync(path.join(__dirname, 'assets', filename), buffer);
        console.log(`Created ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      console.error(`Error creating ${filename}:`, err);
      reject(err);
    });
  });
};

const createIcons = async () => {
  try {
    await createIconFromWeb('icon.png');
    await createIconFromWeb('splash.png');
    await createIconFromWeb('adaptive-icon.png');
    console.log('All icons created successfully');
  } catch (error) {
    console.error('Error creating icons:', error);
  }
};

createIcons();
