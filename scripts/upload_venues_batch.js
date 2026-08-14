const { initializeApp } = require('firebase/app');
const { getFirestore, doc, writeBatch } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

function getFirebaseConfig() {
  let apiKey = process.env.FIREBASE_API_KEY || "";
  let projectId = process.env.FIREBASE_PROJECT_ID || "benchless-app";
  let appId = process.env.FIREBASE_APP_ID || "";

  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (!apiKey) {
      const match = envContent.match(/^FIREBASE_API_KEY=(.+)$/m);
      if (match) apiKey = match[1].trim();
    }
    if (!projectId) {
      const match = envContent.match(/^FIREBASE_PROJECT_ID=(.+)$/m);
      if (match) projectId = match[1].trim();
    }
    if (!appId) {
      const match = envContent.match(/^FIREBASE_APP_ID=(.+)$/m);
      if (match) appId = match[1].trim();
    }
  }

  return { projectId, appId, apiKey };
}

const firebaseConfig = getFirebaseConfig();

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadVenues() {
  const dataDir = path.join(__dirname, '..', 'public', 'data');
  const files = ['doaj_venues.json', 'scopus_venues.json', 'ieee_venues.json'];
  
  let allVenues = [];

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      allVenues = allVenues.concat(data);
      console.log(`Loaded ${data.length} venues from ${file}`);
    } else {
      console.warn(`Warning: ${file} not found, skipping.`);
    }
  }

  console.log(`Total venues to upload: ${allVenues.length}`);

  // Chunk array for batch writes (limit is 500 per batch)
  const chunkSize = 450;
  let successCount = 0;
  
  for (let i = 0; i < allVenues.length; i += chunkSize) {
    const chunk = allVenues.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    
    for (const venue of chunk) {
      const docRef = doc(db, 'venues', venue.id);
      batch.set(docRef, venue);
    }
    
    try {
      await batch.commit();
      successCount += chunk.length;
      console.log(`Uploaded batch ${i / chunkSize + 1} (${successCount}/${allVenues.length})`);
    } catch (err) {
      console.error(`Failed to upload batch ${i / chunkSize + 1}:`, err);
    }
  }

  console.log(`Successfully uploaded ${successCount}/${allVenues.length} total venues to Firestore.`);
  process.exit(0);
}

uploadVenues();
