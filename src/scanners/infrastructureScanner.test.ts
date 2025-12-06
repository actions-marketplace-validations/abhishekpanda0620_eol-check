import { scanInfrastructure } from './infrastructureScanner';
import fs from 'fs';

jest.mock('fs');

describe('infrastructureScanner', () => {
    const mockDir = '/test/dir';

    beforeEach(() => {
        jest.clearAllMocks();
        (fs.readdirSync as jest.Mock).mockReturnValue([]);
    });

    describe('scanInfrastructure', () => {
        it('should return empty array if no infra files exist', () => {
             (fs.existsSync as jest.Mock).mockReturnValue(false);
             (fs.readdirSync as jest.Mock).mockReturnValue([]);
             const results = scanInfrastructure(mockDir);
             expect(results).toEqual([]);
        });

        it('should parse serverless.yml runtimes', () => {
             // Mock existsSync
             (fs.existsSync as jest.Mock).mockImplementation((p: string) => {
                 return p.endsWith('serverless.yml');
             });
             
             (fs.readFileSync as jest.Mock).mockReturnValue(`
service: my-service
provider:
  name: aws
  runtime: nodejs18.x
functions:
  hello:
    handler: handler.hello
`);
            
             const results = scanInfrastructure(mockDir);
             expect(results).toHaveLength(1);
             expect(results[0]).toEqual({
                 name: 'nodejs',
                 version: '18',
                 type: 'infrastructure',
                 file: 'serverless.yml'
             });
        });
        
        it('should parse AWS SAM template.yaml runtimes', () => {
             (fs.existsSync as jest.Mock).mockImplementation((p: string) => {
                 return p.endsWith('template.yaml');
             });
             
             (fs.readFileSync as jest.Mock).mockReturnValue(`
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Resources:
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: app.lambda_handler
      Runtime: python3.9
`);
            
             const results = scanInfrastructure(mockDir);
             expect(results).toHaveLength(1);
             expect(results[0]).toEqual({
                 name: 'python',
                 version: '3.9',
                 type: 'infrastructure',
                 file: 'template.yaml'
             });
        });
        
        it('should handle complex runtimes and comments', () => {
             (fs.existsSync as jest.Mock).mockImplementation((p: string) => {
                 return p.endsWith('serverless.yml');
             });
             
             (fs.readFileSync as jest.Mock).mockReturnValue(`
provider:
  runtime: java11 # Comment
`);
            
             const results = scanInfrastructure(mockDir);
             expect(results).toHaveLength(1);
             expect(results[0]).toEqual({
                 name: 'java', // Maps to amazon-corretto eventually?
                 version: '11',
                 type: 'infrastructure',
                 file: 'serverless.yml'
             });
        });

        it('should ignore lines that look like runtimes but are not', () => {
             (fs.existsSync as jest.Mock).mockReturnValue(true);
             (fs.readFileSync as jest.Mock).mockReturnValue(`
# This is a comment about runtime: nodejs12.x
my-var: "runtime: python2.7"
`);
             // Our regex is simple: starts with "runtime:". 
             // "my-var: "runtime: ..."" won't match `trimmed.startsWith('runtime:')`.
             // "# This..." won't match.
             
             const results = scanInfrastructure(mockDir);
             expect(results).toEqual([]);
        });
        
        it('should handle dotnet runtime', () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue('Runtime: dotnet6');
            
            const results = scanInfrastructure(mockDir);
            expect(results).toContainEqual({
                name: 'dotnet',
                version: '6',
                type: 'infrastructure',
                file: 'template.yaml' // Mock returns same content for all files, so it might appear multiple times if we don't control which file is read.
            });
            // Since we mocked all reads to return 'Runtime: dotnet6', 
            // and scanInfrastructure checks 4 files (serverless.yml, .yaml, template.yaml, .yml),
            // and simple regex matches 'Runtime:' (case sensitive? No, we check Runtime: for template files).
            // 'Runtime: dotnet6' matches 'Runtime:'.
            // parseAwsRuntime handles 'dotnet6' -> 'dotnet', '6'.
            // The tests above rely on `(fs.existsSync as jest.Mock).mockImplementation` to control which file exists.
            // Here I used `mockReturnValue(true)`, so ALL files exist.
            // Serverless checks for `runtime:` (lowercase). 'Runtime: dotnet6' starts with R. Won't match.
            // Template checks for `Runtime:` (case sensitive check in code). Matches.
            // So it should match for template.yaml and template.yml.
            // Expect length 2?

        });

        it('should parse Terraform files (.tf)', () => {
            (fs.readdirSync as jest.Mock).mockReturnValue(['main.tf']);
            (fs.existsSync as jest.Mock).mockImplementation((p: string) => !p.endsWith('serverless.yml') && !p.endsWith('template.yaml')); // Only allow .tf traversal
            
            (fs.readFileSync as jest.Mock).mockReturnValue(`
resource "aws_lambda_function" "test_lambda" {
  filename      = "lambda_function_payload.zip"
  function_name = "lambda_function_name"
  role          = aws_iam_role.iam_for_lambda.arn
  handler       = "index.test"

  source_code_hash = filebase64sha256("lambda_function_payload.zip")

  runtime = "nodejs16.x"

  environment {
    variables = {
      foo = "bar"
    }
  }
}
`);
            
            const results = scanInfrastructure(mockDir);
            expect(results).toContainEqual({
                name: 'nodejs',
                version: '16',
                type: 'infrastructure',
                file: 'main.tf'
            });
        });
    });
});
