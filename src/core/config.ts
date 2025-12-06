import fs from 'fs';
import path from 'path';

export interface EolCheckConfig {
  failOnEol?: boolean;
  failOnWarning?: boolean;
  scanAi?: boolean;
  scanDocker?: boolean;
  scanInfra?: boolean;
  verbose?: boolean;
  excludes?: string[]; // Not fully implemented yet in scanners, but good for config
}

const DEFAULT_CONFIG: EolCheckConfig = {
  failOnEol: true,
  failOnWarning: false,
  scanAi: false,
  scanDocker: false,
  scanInfra: false,
  verbose: false,
  excludes: [],
};

export function loadConfig(cwd: string = process.cwd()): EolCheckConfig {
  let fileConfig: Partial<EolCheckConfig> = {};

  // 1. Look for .eolrc.json
  const rcPath = path.join(cwd, '.eolrc.json');
  if (fs.existsSync(rcPath)) {
    try {
      const content = fs.readFileSync(rcPath, 'utf-8');
      fileConfig = JSON.parse(content);
    } catch (e) {
      console.warn('Warning: Failed to parse .eolrc.json', e);
    }
  } else {
    // 2. Look for eol-check in package.json
    const pkgPath = path.join(cwd, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const content = fs.readFileSync(pkgPath, 'utf-8');
        const pkg = JSON.parse(content);
        if (pkg['eol-check']) {
          fileConfig = pkg['eol-check'];
        }
      } catch {
        // Ignore package.json parsing errors
      }
    }
  }

  // Merge defaults with file config
  return { ...DEFAULT_CONFIG, ...fileConfig };
}
