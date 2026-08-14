const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');

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

async function verifyData() {
  const venuesRef = collection(db, 'venues');
  const q = query(venuesRef, limit(5));
  
  const snapshot = await getDocs(q);
  console.log(`Found ${snapshot.size} venues in the sample query.\n`);
  
  snapshot.forEach((doc) => {
    console.log(`ID: ${doc.id}`);
    console.log(`Data: ${JSON.stringify(doc.data(), null, 2)}\n`);
  });
  
  process.exit(0);
}

verifyData();
