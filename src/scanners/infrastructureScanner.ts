import fs from 'fs';
import path from 'path';
import { Dependency } from './dependencyScanner';

export function scanInfrastructure(dir: string): Dependency[] {
  const dependencies: Dependency[] = [];

  // Helper to process AWS runtimes
  const processRuntime = (runtime: string, file: string) => {
    const parsed = parseAwsRuntime(runtime);
    if (parsed) {
      dependencies.push({
        name: parsed.name,
        version: parsed.version,
        type: 'infrastructure',
        file: file
      });
    }
  };

  // 1. Scan serverless.yml / serverless.yaml
  const serverlessFiles = ['serverless.yml', 'serverless.yaml'];
  for (const file of serverlessFiles) {
    const filePath = path.join(dir, file);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          // Look for 'runtime: <value>'
          if (trimmed.startsWith('runtime:')) {
             const parts = trimmed.split(':');
             if (parts.length >= 2) {
               const runtime = parts[1].trim();
               // Remove comments if any
               const cleanRuntime = runtime.split('#')[0].trim();
               processRuntime(cleanRuntime, file);
             }
          }
        }
      } catch (error) {
        console.warn(`Failed to parse ${file}:`, error);
      }
    }
  }

  // 2. Scan AWS SAM / CloudFormation (template.yaml / template.yml)
  const templateFiles = ['template.yaml', 'template.yml'];
  for (const file of templateFiles) {
    const filePath = path.join(dir, file);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            // Look for 'Runtime: <value>' (Case sensitive usually in CloudFormation but let's be loose)
            // Or "Runtime": "..." in JSON (if file is JSON, but we are parsing YAML extension)
            // YAML keys are usually case sensitive. AWS SAM uses PascalCase 'Runtime'.
            if (trimmed.startsWith('Runtime:')) {
                const parts = trimmed.split(':');
                if (parts.length >= 2) {
                    const runtime = parts[1].trim();
                    const cleanRuntime = runtime.split('#')[0].trim();
                     processRuntime(cleanRuntime, file);
                }
            }
        }
      } catch (error) {
        console.warn(`Failed to parse ${file}:`, error);
      }
    }
  }
  
  // 3. Scan Terraform files (.tf)
  const tfFiles = fs.readdirSync(dir).filter(f => f.endsWith('.tf'));
  for (const file of tfFiles) {
     const filePath = path.join(dir, file);
     try {
       const content = fs.readFileSync(filePath, 'utf-8');
       const lines = content.split('\n');
       for (const line of lines) {
           const trimmed = line.trim();
           // runtime = "nodejs18.x"
           if (trimmed.startsWith('runtime')) {
               const match = trimmed.match(/runtime\s*=\s*["']([^"']+)["']/);
               if (match) {
                   processRuntime(match[1], file);
               }
           }
       }
     } catch (error) {
       console.warn(`Failed to parse ${file}:`, error);
     }
  }

  return dependencies;
}

function parseAwsRuntime(runtime: string): { name: string, version: string } | null {
    // AWS Lambda Runtimes: https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html
    const r = runtime.toLowerCase();
    
    if (r.startsWith('nodejs')) {
        // nodejs18.x -> 18
        // nodejs20.x -> 20
        // nodejs12.x -> 12
        const ver = r.replace('nodejs', '').replace('.x', '');
        return { name: 'nodejs', version: ver };
    }
    if (r.startsWith('python')) {
        // python3.9
        const ver = r.replace('python', '');
        return { name: 'python', version: ver };
    }
    if (r.startsWith('java')) {
        // java11, java17, java8.al2
        let ver = r.replace('java', '');
        // handle java8.al2 -> 8
        if (ver.includes('.')) ver = ver.split('.')[0];
        return { name: 'java', version: ver }; // 'java' maps to ? java? or corretto? Usually java/openapi-jdk
    }
    if (r.startsWith('dotnet')) {
        // dotnet6, dotnetcore3.1
        let ver = r.replace('dotnet', '').replace('core', '');
        return { name: 'dotnet', version: ver }; // Maps to dotnet
    }
    if (r.startsWith('ruby')) {
        // ruby3.2
        const ver = r.replace('ruby', '');
        return { name: 'ruby', version: ver };
    }
    if (r.startsWith('go')) {
        // go1.x provided.al2
        // go1.x -> 1.x
        // we might just return 'go' '1'
        return { name: 'go', version: '1' };
    }
    
    return null;
}
