import { writeFile } from 'fs';
import { exec } from 'child_process';
import * as path from 'path';

const buildVersion = '1.0.0'; // Or fetch from another source if needed

exec('git rev-parse HEAD', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error fetching git commit hash: ${stderr}`);
    process.exit(1);
  } else {
    const commitHash = stdout.trim();

    const versionInfo = {
      buildVersion,
      gitCommitHash: commitHash,
    };

    const filePath = path.join(__dirname, 'version.json');
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    writeFile(filePath, JSON.stringify(versionInfo, null, 2), (err) => {
      if (err) {
        console.error(`Error writing version file: ${err}`);
        process.exit(1);
      } else {
        console.log('Version info updated:', versionInfo);
      }
    });
  }
});
