const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "benchless-app",
  appId: "1:561247944900:web:c1287d107f29b551a74991",
  apiKey: "AIzaSyC6txlBro2VPALcFRdTy1v8Y_Zl74feMhg"
};

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
