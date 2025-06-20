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
- `theme` - Color theme of the badge (options: `dark`, `light`, default: `dark`)

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
