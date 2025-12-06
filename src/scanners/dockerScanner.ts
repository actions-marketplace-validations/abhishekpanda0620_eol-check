import fs from 'fs';
import path from 'path';
import { Dependency } from './dependencyScanner';

export function scanDockerfiles(dir: string): Dependency[] {
  const dependencies: Dependency[] = [];
  const dockerfilePath = path.join(dir, 'Dockerfile');

  if (fs.existsSync(dockerfilePath)) {
    try {
      const content = fs.readFileSync(dockerfilePath, 'utf-8');
      const lines = content.split('\n');

      for (const line of lines) {
        const trimmed = line.trim();
        // Match FROM instructions
        // FROM [--platform=<platform>] <image>[:<tag>] [AS <name>]
        // We ignore platform flag for now
        if (trimmed.toUpperCase().startsWith('FROM ')) {
            // Remove 'FROM '
            let part = trimmed.substring(5).trim();
            
            // Remove --platform=... if present
            if (part.startsWith('--platform=')) {
                part = part.replace(/--platform=[^\s]+\s+/, '');
            }

            // Remove ' AS ...' if present
            // Handle lowercase 'as' or uppercase 'AS'
            const asIndex = part.toUpperCase().indexOf(' AS ');
            if (asIndex !== -1) {
                part = part.substring(0, asIndex);
            }
            
            // Now part should be "image:tag" or "image"
            // Handles cases like "mcr.microsoft.com/dotnet/sdk:6.0"
            
            const match = part.match(/^([^\s:]+)(?::([^\s]+))?$/);
            if (match) {
                const rawName = match[1];
                let version = match[2] || 'latest';
                
                // Clean version (e.g. "18-alpine" -> "18")
                // We use cleanVersion for this, but cleanVersion is designed for semver-ish things.
                // Docker tags can be "alpine", "slim", "latest".
                // If version is purely alpha, we might not want to "clean" it to empty string?
                // cleanVersion("alpine") -> "alpine" (if regex doesn't match digits)
                // Let's check cleanVersion implementation:
                // const match = version.match(/(\d+(\.\d+)*)/); return match ? match[0] : version;
                // cleanVersion("18-alpine") -> "18"
                // cleanVersion("latest") -> "latest"
                // cleanVersion("3.9-slim") -> "3.9"
                
                // Handle image names that are paths:
                // mcr.microsoft.com/dotnet/sdk -> we probably want "dotnet" or "dotnet/sdk"
                // For direct mapping to EOL products, we might need a better mapper.
                // For now, let's store the full name.
                
                dependencies.push({
                    name: rawName,
                    version: version, // We keep original version string here? Or cleaned?
                                      // dependencyScanner uses "version" field.
                                      // evaluating typically needs clean version.
                                      // But usually the scanner provides the raw version?
                                      // In dependencyScanner:
                                      // type: 'npm', version: String(version) (raw)
                                      // So we should probably return raw version here and let evaluator clean it?
                                      // However, for Docker, "18-alpine" IS the version string.
                    type: 'docker',
                    file: 'Dockerfile'
                });
            }
        }
      }
    } catch (error) {
      console.warn('Failed to parse Dockerfile:', error);
    }
  }

  return dependencies;
}
