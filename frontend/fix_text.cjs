const fs = require('fs');

let content = fs.readFileSync('src/pages/Landing.jsx', 'utf8');

content = content.replace(/v2\.0 \/\/ DISTRIBUTED BLOCKCHAIN MONITORING/g, 'v2.0 // DISTRIBUTED EXPOSURE TRACKING');
content = content.replace(/Built for Blockchain Forensics/g, 'Built for Exposure Forensics');
content = content.replace(/suspicious blockchain activity .*?intelligence\./g, 'dark web intelligence — from raw exposure data to actionable takedowns.');
content = content.replace(/blockchain forensics platform .*?rendering\./g, 'data exposure platform — from continuous broker scanning to proactive credential suppression.');

fs.writeFileSync('src/pages/Landing.jsx', content);
