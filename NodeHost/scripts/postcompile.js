const { execSync } = require('child_process');
const { version } = require('../src/version.json');

(async () => {
  const windowsVersion = '19.' + version; // prepend 19 since previous versions were 18.*, and we need a higher version for the msi to update the exe; used in update-version

  await new Promise((resolve) => { setTimeout(resolve, 2000); }); // ensure compile done/file freed

  // we use resedit instead of rcedit because we need the no-grow flag
  execSync(`npx resedit src/YTDPwin.exe -o src/YTDPwin.exe --file-version ${windowsVersion} --product-version ${windowsVersion} --no-grow`, {
    stdio: 'inherit'
  });
})();
