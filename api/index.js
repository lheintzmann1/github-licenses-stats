const express = require('express');
const app = express();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const PORT = process.env.PORT || 3000;

// Helper: Fetch all repos for a given user (public only)
async function fetchAllRepos(username) {
  let repos = [];
  let page = 1;
  while (true) {
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&page=${page}`, {
      headers: { 'User-Agent': 'github-license-stats' }
    });
    if (!res.ok) break;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    repos = repos.concat(data);
    page++;
  }
  return repos;
}

// Color schemes for different licenses
const licenseColors = {
  'MIT': '#28a745',
  'ISC': '#34d058',
  '0BSD': '#40d465',
  
  'Apache-2.0': '#fd7e14',
  
  'BSD-2-Clause': '#0969da',
  'BSD-3-Clause': '#1f6feb',
  'BSD-3-Clause-Clear': '#218bff',
  'BSD-4-Clause': '#0550ae',
  
  'GPL': '#8b5cf6',
  'GPL-2.0': '#7c3aed',
  'GPL-3.0': '#8b5cf6',
  'AGPL-3.0': '#581c87',
  
  'LGPL': '#c084fc',
  'LGPL-2.1': '#ddd6fe',
  'LGPL-3.0': '#c084fc',
  
  'MPL-2.0': '#ec4899',
  
  'EPL-1.0': '#6366f1',
  'EPL-2.0': '#4f46e5',
  
  'CC': '#06b6d4',
  'CC0-1.0': '#22d3ee',
  'CC-BY-4.0': '#0891b2',
  'CC-BY-SA-4.0': '#0e7490',
  
  'Unlicense': '#94a3b8',
  'WTFPL': '#cbd5e1',
  
  'Artistic-2.0': '#22d3ee',
  'AFL-3.0': '#67e8f9',
  'OFL-1.1': '#a5f3fc',
  'LPPL-1.3c': '#cffafe',
  
  'BSL-1.0': '#facc15',
  'Zlib': '#fbbf24',
  'PostgreSQL': '#f59e0b',
  'NCSA': '#eab308',
  
  'ECL-2.0': '#10b981',
  
  'EUPL-1.1': '#8b5cf6',
  
  'MS-PL': '#0ea5e9',
  
  'OSL-3.0': '#f43f5e',
  
  'NOASSERTION': '#6b7280'
};

// Theme configuration
const themes = {
  dark: {
    background: {
      gradient: {
        start: '#0d1117',
        end: '#161b22'
      }
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.6)',
      tertiary: 'rgba(255, 255, 255, 0.8)'
    },
    border: 'rgba(255, 255, 255, 0.05)',
    barBackground: 'rgba(255, 255, 255, 0.05)'
  },
  light: {
    background: {
      gradient: {
        start: '#ffffff',
        end: '#f6f8fa'
      }
    },
    text: {
      primary: '#24292f',
      secondary: 'rgba(36, 41, 47, 0.6)',
      tertiary: 'rgba(36, 41, 47, 0.8)'
    },
    border: 'rgba(0, 0, 0, 0.05)',
    barBackground: 'rgba(0, 0, 0, 0.05)'
  },
  radical: {
    background: {
      gradient: {
        start: '#141321',
        end: '#141321'
      }
    },
    text: {
      primary: '#fe428e',
      secondary: 'rgba(169, 254, 247, 1)',
      tertiary: 'rgba(248, 216, 71, 1)'
    },
    border: 'rgba(255, 255, 255, 0.05)',
    barBackground: 'rgba(255, 255, 255, 0.05)'
  },
  merko: {
    background: {
      gradient: {
        start: '#0a0f0b',
        end: '#0a0f0b'
      }
    },
    text: {
      primary: '#abd200',
      secondary: 'rgba(104, 181, 135, 1)',
      tertiary: 'rgba(183, 211, 100, 1)'
    },
    border: 'rgba(255, 255, 255, 0.05)',
    barBackground: 'rgba(255, 255, 255, 0.05)'
  },
  gruvbox: {
    background: {
      gradient: {
        start: '#282828',
        end: '#282828'
      }
    },
    text: {
      primary: '#fabd2f',
      secondary: 'rgba(142, 192, 124, 1)',
      tertiary: 'rgba(254, 128, 25, 1)'
    },
    border: 'rgba(255, 255, 255, 0.05)',
    barBackground: 'rgba(255, 255, 255, 0.05)'
  },
  tokyonight: {
    background: {
      gradient: {
        start: '#1a1b27',
        end: '#1a1b27'
      }
    },
    text: {
      primary: '#70a5fd',
      secondary: 'rgba(56, 189, 174, 1)',
      tertiary: 'rgba(191, 145, 243, 1)'
    },
    border: 'rgba(255, 255, 255, 0.05)',
    barBackground: 'rgba(255, 255, 255, 0.05)'
  },
  onedark: {
    background: {
      gradient: {
        start: '#282c34',
        end: '#282c34'
      }
    },
    text: {
      primary: '#e4bf7a',
      secondary: 'rgba(223, 109, 116, 1)',
      tertiary: 'rgba(142, 181, 115, 1)'
    },
    border: 'rgba(255, 255, 255, 0.05)',
    barBackground: 'rgba(255, 255, 255, 0.05)'
  }
};

// Get color for license (with fallback)
function getLicenseColor(license) {
  return licenseColors[license] || '#858585';
}

// Calculate bar width based on percentage
function getBarWidth(count, maxCount, maxWidth = 200) {
  return Math.max(20, (count / maxCount) * maxWidth);
}

// Helper: Generate beautiful SVG card
function renderSVG(username, topLicenses, count, theme = 'dark') {
  const cardWidth = 500;
  const headerHeight = 60;  // Reduced header height
  const itemHeight = 40;    // Slightly reduced item height
  const padding = 20;
  const barMaxWidth = 220;  // Increased bar width
  
  const contentHeight = topLicenses.length * itemHeight;
  const totalHeight = headerHeight + contentHeight + (padding * 2);
  
  const maxCount = topLicenses.length > 0 ? topLicenses[0][1] : 1;
  // Calculate total repositories for accurate percentage
  const totalRepos = topLicenses.reduce((sum, [_, count]) => sum + count, 0);
  
  // Get theme colors (with fallback to dark theme)
  const { background, text, border, barBackground } = themes[theme] || themes['dark'];
  
  let svg = `
  <svg width="${cardWidth}" height="${totalHeight}" viewBox="0 0 ${cardWidth} ${totalHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${background.gradient.start};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${background.gradient.end};stop-opacity:1" />
      </linearGradient>
      
      <filter id="shadow" x="-2%" y="-2%" width="104%" height="104%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.25"/>
      </filter>
      
      <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <style>
      .card-bg { 
        fill: url(#bgGradient); 
        filter: url(#shadow);
      }
      .border { 
        stroke: ${border}; 
        stroke-width: 1; 
      }
      .title { 
        font: bold 18px -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif; 
        fill: ${text.primary}; 
        text-anchor: start;
      }
      .subtitle {
        font: 14px -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif; 
        fill: ${text.secondary}; 
        text-anchor: start;
      }
      .license-name { 
        font: bold 14px -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif; 
        fill: ${text.primary}; 
      }
      .license-count { 
        font: 12px -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif; 
        fill: ${text.secondary}; 
      }
      .percentage {
        font: 12px -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif; 
        fill: ${text.tertiary}; 
      }
      .bar {
        rx: 4;
        ry: 4;
        filter: url(#glow);
        opacity: 0.9;
      }
      .bar-bg {
        fill: ${barBackground};
        rx: 4;
        ry: 4;
      }
      .rank {
        font: bold 11px -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif; 
        fill: #ffffff;
        text-anchor: middle;
      }      .github-icon {
        fill: ${text.tertiary};
      }
    </style>
    
    <rect x="0" y="0" width="${cardWidth}" height="${totalHeight}" rx="10" class="card-bg border"/>
    
    <g transform="translate(${padding}, ${padding + 20})">

      <svg x="0" y="-10" width="20" height="20" viewBox="0 0 16 16" class="github-icon">
        <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
      </svg>
      
      <text x="30" y="0" class="title">Top ${count} Licenses</text>
      <text x="30" y="20" class="subtitle">@${username}</text>
    </g>
  `;

  // Add license items
  topLicenses.forEach(([license, licenseCount], idx) => {
    const y = headerHeight + padding + (idx * itemHeight);
    const percentage = Math.round((licenseCount / totalRepos) * 100);
    const barWidth = getBarWidth(licenseCount, maxCount, barMaxWidth);
    const color = getLicenseColor(license);
    
    // Background bar
    svg += `<rect x="${padding + 35}" y="${y + 10}" width="${barMaxWidth}" height="16" class="bar-bg"/>`;
    
    // Progress bar
    svg += `<rect x="${padding + 35}" y="${y + 10}" width="${barWidth}" height="16" class="bar" fill="${color}"/>`;
    
    // Rank circle
    svg += `<circle cx="${padding + 15}" cy="${y + 18}" r="10" fill="${color}"/>`;
    svg += `<text x="${padding + 15}" y="${y + 22}" class="rank">${idx + 1}</text>`;
    
    // License name
    const displayLicense = license === 'NOASSERTION' ? 'No License' : license;
    svg += `<text x="${padding + 45 + barMaxWidth}" y="${y + 15}" class="license-name">${displayLicense}</text>`;
    
    // Count and percentage
    svg += `<text x="${padding + 45 + barMaxWidth}" y="${y + 30}" class="license-count">${licenseCount} repos</text>`;
    svg += `<text x="${cardWidth - padding}" y="${y + 20}" class="percentage" text-anchor="end">${percentage}%</text>`;
  });

  svg += `</svg>`;
  return svg;
}

app.get('/api/top-licenses', async (req, res) => {
  const username = req.query.username;
  const count = Math.max(1, Math.min(10, Number(req.query.count) || 5)); // limit 1-10
  const theme = req.query.theme || 'dark'; // default to dark theme

  if (!username) {
    res.status(400).send('Missing username parameter.');
    return;
  }
  try {
    const repos = await fetchAllRepos(username);
    if (repos.length === 0) throw new Error('No repos found.');
    const licenseCounts = {};
    repos.forEach(r => {
      let lic = (r.license && r.license.spdx_id) || 'NOASSERTION';
      licenseCounts[lic] = (licenseCounts[lic] || 0) + 1;
    });
    const topLicenses = Object.entries(licenseCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count);

    res.set('Content-Type', 'image/svg+xml');
    res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(renderSVG(username, topLicenses, count, theme));
  } catch (e) {
    res.status(500).send('Error: ' + e.message);
  }
});

app.get('/', (req, res) => {
  res.redirect('https://github.com/lheintzmann1/github-licenses-stats');
});

app.listen(PORT, () => {
  console.log(`GitHub License Stats listening at http://localhost:${PORT}`);
});