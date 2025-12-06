import { scanDockerfiles } from './dockerScanner';
import fs from 'fs';
import path from 'path';

jest.mock('fs');

describe('dockerScanner', () => {
  const mockDir = '/test/dir';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('scanDockerfiles', () => {
    it('should return empty array if Dockerfile does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const results = scanDockerfiles(mockDir);

      expect(results).toEqual([]);
      expect(fs.existsSync).toHaveBeenCalledWith(path.join(mockDir, 'Dockerfile'));
    });

    it('should parse simple FROM instructions', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(`
FROM node:18
FROM python:3.9
`);

      const results = scanDockerfiles(mockDir);

      expect(results).toHaveLength(2);
      expect(results).toContainEqual({
        name: 'node',
        version: '18',
        type: 'docker',
        file: 'Dockerfile',
      });
      expect(results).toContainEqual({
        name: 'python',
        version: '3.9',
        type: 'docker',
        file: 'Dockerfile',
      });
    });

    it('should handle images without versions (implicit latest)', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('FROM ubuntu');

      const results = scanDockerfiles(mockDir);

      expect(results).toHaveLength(1);
      expect(results).toContainEqual({
        name: 'ubuntu',
        version: 'latest',
        type: 'docker',
        file: 'Dockerfile',
      });
    });

    it('should handle AS aliasing', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(`
FROM node:18 AS builder
FROM nginx:alpine as runtime
`);

      const results = scanDockerfiles(mockDir);

      expect(results).toHaveLength(2);
      expect(results).toContainEqual({
        name: 'node',
        version: '18',
        type: 'docker',
        file: 'Dockerfile',
      });
      // "nginx:alpine" -> name: nginx, version: alpine. 
      // This confirms we capture "alpine" as version, which is correct for Docker tags.
      expect(results).toContainEqual({
        name: 'nginx',
        version: 'alpine',
        type: 'docker',
        file: 'Dockerfile',
      });
    });

    it('should handle platform flags', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('FROM --platform=linux/amd64 node:16');

      const results = scanDockerfiles(mockDir);

      expect(results).toHaveLength(1);
      expect(results).toContainEqual({
        name: 'node',
        version: '16',
        type: 'docker',
        file: 'Dockerfile',
      });
    });

    it('should handle complex image names', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('FROM mcr.microsoft.com/dotnet/sdk:6.0');

      const results = scanDockerfiles(mockDir);

      expect(results).toHaveLength(1);
      expect(results).toContainEqual({
        name: 'mcr.microsoft.com/dotnet/sdk',
        version: '6.0',
        type: 'docker',
        file: 'Dockerfile',
      });
    });
    
    it('should handle parsing errors gracefully', () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        // Force readFileSync to throw
        (fs.readFileSync as jest.Mock).mockImplementation(() => {
            throw new Error('Read error');
        });
        
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        
        const results = scanDockerfiles(mockDir);
        
        expect(results).toEqual([]);
        expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
