---
layout: default
title: Home
---

# eol-check

**A CLI tool to check the End-Of-Life (EOL) status of your development environment, project dependencies, and AI/ML models.**

[![npm version](https://img.shields.io/npm/v/eol-check.svg)](https://www.npmjs.com/package/eol-check)
[![CI](https://github.com/abhishekpanda0620/eol-check/actions/workflows/ci.yml/badge.svg)](https://github.com/abhishekpanda0620/eol-check/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

-   **Automated Detection**: Detects Node.js version, package manager (npm/yarn/pnpm), and OS (Ubuntu/Alpine/Debian).
-   **System Service Scanning**: Detects and checks EOL status of local system services (Redis, PostgreSQL, Docker, etc.).
-   **Infrastructure Scanning** *(v1.6.0)*: Scans Dockerfiles, Serverless configs, AWS SAM templates, Terraform files, and CloudFormation for EOL runtimes.
-   **AI/ML Model Tracking**: Scans for AI model usage and checks deprecation status for OpenAI, Anthropic, Google, Meta, Mistral, and Cohere models.
-   **Unified Configuration** *(v1.6.0)*: Configure all settings via `.eolrc.json` or `package.json`.
-   **Real-time Data**: Fetches the latest EOL data from [endoflife.date](https://endoflife.date) and AI provider documentation.
-   **Actionable Feedback**: clearly indicates if a component is supported, approaching EOL, or EOL.

## Installation

### Global Installation

```bash
npm install -g eol-check
```

### Local/Project Installation

```bash
npm install --save-dev eol-check
```

## Quick Start

Run the tool in any project directory:

```bash
eol-check
```

## Documentation

- [GitHub Usage](https://github.com/abhishekpanda0620/eol-check#usage)
- [Supported Scanners](https://github.com/abhishekpanda0620/eol-check#supported-scanners)
- [View Roadmap](https://github.com/abhishekpanda0620/eol-check/blob/main/ROADMAP.md)

[View on GitHub](https://github.com/abhishekpanda0620/eol-check)
