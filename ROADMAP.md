# EOL-Check Roadmap

This document outlines the planned features and improvements for `eol-check`. Community feedback and contributions are welcome!

## 🚀 v1.4 - Enhanced User Experience

### Auto-Open HTML Reports
**Status:** Planned  
**Priority:** High

Automatically open generated HTML reports in the default browser instead of just saving them to disk.

```bash
eol-check --html report.html  # Opens in browser automatically
eol-check --html report.html --no-browser  # Opt-out option
```

**Implementation:**
- Add `open` package dependency
- Add `--no-browser` flag to disable auto-open
- Platform-aware browser detection (Windows, macOS, Linux)

---

### Query Specific Services
**Status:** Planned  
**Priority:** High

Allow users to query specific services/versions without auto-detection.

```bash
# Query specific service
eol-check query nodejs 18.0.0
eol-check query python 3.9
eol-check --service redis --version 7.0

# Check multiple services at once
eol-check query nodejs:18.0.0 python:3.9 redis:7.0
```

**Use Cases:**
- Quick EOL lookups without project context
- CI/CD planning and migration planning
- Documentation and research

---

## 🔮 v1.5 - Modular Data Sources

### Multi-Provider Architecture
**Status:** Planned  
**Priority:** High

Create a modular data source system to support multiple EOL data providers beyond endoflife.date.

**Providers to Support:**

#### 1. AI/ML Models Provider
Track deprecation and EOL for AI models:
- **OpenAI**: GPT-3.5-turbo, GPT-4, DALL-E versions
- **Anthropic**: Claude 1, Claude 2, Claude 3 variants
- **Google**: Gemini, PaLM, Bard versions
- **Meta**: Llama 2, Llama 3 versions
- **AWS Bedrock**: Model availability and deprecation
- **Azure OpenAI**: Model version lifecycle
- **Hugging Face**: Popular model versions

```bash
eol-check --provider openai
# Detects OpenAI SDK versions in project and checks model support
```

#### 2. Cloud Services Provider
- **AWS**: Lambda runtimes, RDS engine versions, EKS versions
- **Azure**: Function runtimes, App Service versions
- **GCP**: Cloud Functions runtimes, GKE versions
- **Serverless Frameworks**: Framework versions and runtime support

#### 3. Custom Data Provider
Allow users to define custom EOL data via JSON/YAML files:

```yaml
# .eol-check.yml
custom-products:
  - name: internal-service-v1
    version: 1.0.0
    eol: 2025-12-31
    support: 2025-06-30
    
  - name: legacy-api
    version: 2.0.0
    eol: 2024-12-31
    lts: false
```

**Architecture:**
```typescript
interface DataProvider {
  name: string;
  fetchEOL(product: string): Promise<EOLData[]>;
  supports(product: string): boolean;
  priority: number; // For provider ordering
}

class DataProviderRegistry {
  registerProvider(provider: DataProvider): void;
  getProviders(product: string): DataProvider[];
  query(product: string, version: string): Promise<EOLResult>;
}
```

---

## 🌟 v2.0 - Advanced Features

### Interactive Dashboard
**Status:** Idea  
**Priority:** Medium

Web-based interactive dashboard for visualizing EOL status across projects.

- Real-time EOL monitoring
- Historical trend analysis
- Team/organization-wide visibility
- Slack/Teams notifications for approaching EOL
- Integration with project management tools

---

### AI-Powered Recommendations
**Status:** Idea  
**Priority:** Medium

Use AI to provide intelligent upgrade recommendations:
- Suggest migration paths for EOL software
- Estimate upgrade effort based on breaking changes
- Generate upgrade scripts/guides
- Compatibility matrix for version combinations

```bash
eol-check --recommend
# Output:
# Recommendation: Upgrade Node.js 16 → 20 (LTS)
# Estimated effort: Medium
# Breaking changes: 3 detected
# Migration guide: https://nodejs.org/en/blog/release/v20.0.0
```

---

### Registry/Database Support
**Status:** Idea  
**Priority:** Low

Check EOL status for database schemas, container images, and package registries:
- Docker images (FROM base images)
- Database migrations and schema versions
- Internal package registries
- Kubernetes manifests (apiVersion deprecations)

---

## 🤝 Community Ideas

> Have an idea? [Open an issue](https://github.com/abhishekpanda0620/eol-check/issues/new) or submit a PR!

### Potential Features
- [ ] Plugin system for custom scanners
- [ ] VSCode extension with inline warnings
- [ ] Pre-commit hooks for EOL detection
- [ ] SBOM (Software Bill of Materials) export
- [ ] Integration with Dependabot/Renovate
- [ ] Notification webhooks (email, Slack, Discord)
- [ ] Multi-language support for reports
- [ ] Historical EOL analytics and trends
- [ ] Terraform/IaC version scanning
- [ ] API endpoint for programmatic access



## 🚧 Technical Debt & Improvements

### Code Quality
- [ ] Increase test coverage to 90%+
- [ ] Add integration tests
- [ ] Performance benchmarking
- [ ] Refactor scanner engine for better modularity

### Documentation
- [ ] API documentation
- [ ] Plugin development guide
- [ ] Architecture decision records (ADRs)
- [ ] Video tutorials

### DevOps
- [ ] Automated release workflow
- [ ] Canary releases for npm
- [ ] Performance monitoring
- [ ] Usage analytics (opt-in)

---

## 💡 Contributing

Want to help build these features? Check out our [Contributing Guide](CONTRIBUTING.md) and pick an item from this roadmap!

For major features, please open a discussion issue first to align on design and approach.

---

**Last Updated:** December 3, 2025  
**Maintainer:** [@abhishekpanda0620](https://github.com/abhishekpanda0620)
