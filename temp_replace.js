const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content.length;
  content = content.replace(/Nông hộ/g, 'Hộ Nông dân');
  content = content.replace(/Nông Hộ/g, 'Hộ Nông dân');
  content = content.replace(/nông hộ/g, 'hộ nông dân');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Checked ${filePath}.`);
}

const files = [
  'README.md',
  'SYSTEM_DOCS.md',
  'src/App.jsx',
  'src/components/Sidebar.jsx',
  'src/components/SCFTab.jsx',
  'src/components/SupplyModal.jsx',
  'src/components/OverviewTab.jsx',
  'src/components/SCFModal.jsx',
  'src/components/InvoicesTab.jsx',
  'src/components/GlobalLogin.jsx',
  'src/components/Header.jsx',
  'src/components/FarmersTab.jsx',
  'src/components/FarmerPortalTab.jsx',
  'src/components/DisasterModal.jsx',
  'src/components/OracleModal.jsx'
];

files.forEach(f => {
  const p = path.join(__dirname, f);
  if (fs.existsSync(p)) {
    replaceInFile(p);
  }
});
