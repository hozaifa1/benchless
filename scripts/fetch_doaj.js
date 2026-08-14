const { parse } = require('csv-parse');
const fs = require('fs');
const path = require('path');
const https = require('https');

const DOAJ_URL = 'https://doaj.org/csv';
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'data', 'doaj_venues.json');

// Ensure directory exists
fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });

async function fetchDOAJ() {
  console.log('Fetching DOAJ CSV...');
  
  // Follow redirects manually since http.get doesn't follow redirects by default in Node.js
  const getUrl = (url) => {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          console.log(`Redirecting to: ${res.headers.location}`);
          resolve(getUrl(res.headers.location));
        } else if (res.statusCode === 200) {
          resolve(res);
        } else {
          reject(new Error(`Failed to fetch DOAJ CSV. Status: ${res.statusCode}`));
        }
      }).on('error', reject);
    });
  };

  try {
    const res = await getUrl(DOAJ_URL);
    
    const parser = res.pipe(parse({
      columns: true,
      skip_empty_lines: true
    }));

    const venues = [];
    let count = 0;

    for await (const record of parser) {
      const title = record['Journal title'];
      const p_issn = record['Journal ISSN (print version)'];
      const e_issn = record['Journal EISSN (online version)'];
      const url = record['Journal URL'];
      
      const identifier = e_issn || p_issn || title;
      if (!identifier) continue;
      
      // Create a slug for the doc ID
      const id = identifier.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      venues.push({
        id,
        title,
        source: 'DOAJ',
        sourceUrl: url || 'https://doaj.org/',
        isLegitimate: true,
        indexedAt: new Date().toISOString()
      });
      
      count++;
      if (count % 5000 === 0) {
        console.log(`Parsed ${count} DOAJ journals...`);
      }
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(venues, null, 2));
    console.log(`Successfully extracted ${venues.length} DOAJ venues to ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('Error fetching DOAJ:', error);
    process.exit(1);
  }
}

fetchDOAJ();
