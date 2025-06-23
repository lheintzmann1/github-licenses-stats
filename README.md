# github-licenses-stats

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Live Demo](https://deploy-badge.vercel.app/vercel/github-licenses-stats)](https://github-licenses-stats.vercel.app/)
[![Vercel Deploy](https://img.shields.io/badge/vercel-deploy-black?style=flat&logo=vercel)](https://vercel.com/new/clone?repository-url=https://github.com/lheintzmann1/github-licenses-stats)

## About

This tool generates a dynamic SVG that shows the top licenses used across your GitHub repositories. It's perfect for showcasing the license distribution in your GitHub profile.

## Usage

### Markdown Example

```markdown
![Used Licenses](https://github-licenses-stats.vercel.app/api/top-licenses?username=USERNAME&count=5&theme=light)
```

![Github](https://github-licenses-stats.vercel.app/api/top-licenses?username=GITHUB&count=8&theme=light)

### HTML Example

```html
<img src="https://github-licenses-stats.vercel.app/api/top-licenses?username=USERNAME&count=5&theme=dark" alt="Used Licenses">
```

<img src="https://github-licenses-stats.vercel.app/api/top-licenses?username=GITHUB&count=8&theme=dark" alt="Used Licenses">

## Parameters

- `username` - Your GitHub username
- `count` - Number of licenses to display (default: 5, maximum: 10)
- `theme` - Color theme of the badge (options: `dark`, `light`, `radical`, `merko`, `gruvbox`, `tokyonight`, `onedark`; default: `dark`)

## Supported Licenses

The following licenses are supported with custom colors:

### Permissive Licenses
- **MIT** - MIT License
- **ISC** - ISC License
- **0BSD** - BSD Zero Clause License
- **Apache-2.0** - Apache License 2.0
- **BSL-1.0** - Boost Software License 1.0
- **Zlib** - zlib License
- **PostgreSQL** - PostgreSQL License
- **NCSA** - University of Illinois/NCSA Open Source License

### BSD Licenses
- **BSD-2-Clause** - BSD 2-Clause "Simplified" License
- **BSD-3-Clause** - BSD 3-Clause "New" or "Revised" License
- **BSD-3-Clause-Clear** - BSD 3-Clause Clear License
- **BSD-4-Clause** - BSD 4-Clause "Original" or "Old" License

### GPL Licenses
- **GPL** - GNU General Public License
- **GPL-2.0** - GNU General Public License v2.0
- **GPL-3.0** - GNU General Public License v3.0
- **AGPL-3.0** - GNU Affero General Public License v3.0

### LGPL Licenses
- **LGPL** - GNU Lesser General Public License
- **LGPL-2.1** - GNU Lesser General Public License v2.1
- **LGPL-3.0** - GNU Lesser General Public License v3.0

### Other Copyleft Licenses
- **MPL-2.0** - Mozilla Public License 2.0
- **EPL-1.0** - Eclipse Public License 1.0
- **EPL-2.0** - Eclipse Public License 2.0
- **ECL-2.0** - Educational Community License v2.0
- **EUPL-1.1** - European Union Public License 1.1
- **OSL-3.0** - Open Software License 3.0

### Creative Commons Licenses
- **CC** - Creative Commons
- **CC0-1.0** - Creative Commons Zero v1.0 Universal
- **CC-BY-4.0** - Creative Commons Attribution 4.0 International
- **CC-BY-SA-4.0** - Creative Commons Attribution Share Alike 4.0 International

### Public Domain & Unlicense
- **Unlicense** - The Unlicense
- **WTFPL** - Do What The F*ck You Want To Public License

### Specialized Licenses
- **Artistic-2.0** - Artistic License 2.0
- **AFL-3.0** - Academic Free License v3.0
- **OFL-1.1** - SIL Open Font License 1.1
- **LPPL-1.3c** - LaTeX Project Public License v1.3c
- **MS-PL** - Microsoft Public License

### Special Cases
- **NOASSERTION** - No License Detected

*Note: If a license is not in the list above, it will be displayed with a default gray color.*

## Development

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Run locally:

   ```bash
   npm run dev
   ```

4. Access at `http://localhost:3000/api/top-licenses?username=YOUR_USERNAME`

## Deployment

This project is designed to be deployed on Vercel.

## License

See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.
