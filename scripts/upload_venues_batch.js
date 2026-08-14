const { initializeApp } = require('firebase/app');
const { getFirestore, doc, writeBatch } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

const firebaseConfig = {
  projectId: "benchless-app",
  appId: "1:561247944900:web:c1287d107f29b551a74991",
  apiKey: "AIzaSyC6txlBro2VPALcFRdTy1v8Y_Zl74feMhg"
};

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
