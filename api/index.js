const express = require('express');
const path = require('path');
const compression = require('compression');
const { Redis } = require('@upstash/redis');
const fetch = require('node-fetch');

const app = express();
app.use(compression());

// Initialize Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Import configuration files
const themes = require('./config/themes.json');
const licenseColors = require('./config/licenses.json');

const PORT = process.env.PORT || 3000;

// Helper: Fetch all repos for a given user (public only)
async function fetchAllRepos(username) {
  // Try to get from cache first
  const cacheKey = `repos:${username}`;
  const cachedRepos = await redis.get(cacheKey);
  if (cachedRepos) {
    return cachedRepos;
  }

  let repos = [];
  let page = 1;
  
  try {
    while (true) {
      const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&page=${page}`, {
        headers: { 
          'User-Agent': 'github-license-stats',
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (!res.ok) {
        if (res.status === 404) return [];
        if (res.status === 403) throw new Error('Rate limit exceeded');
        if (res.status === 401) throw new Error('Authentication required');
        throw new Error(`GitHub API error: ${res.status}`);
      }
      
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;
      
      repos = repos.concat(data);
      page++;
      
      if (data.length < 100) break;
    }
    
    // Cache the results for 1 hour
    if (repos.length > 0) {
      await redis.set(cacheKey, repos, { ex: 3600 });
    }
    
    return repos;
  } catch (error) {
    console.error(`Error fetching repos for ${username}:`, error);
    return [];
  }
}

// Get color for license (with fallback)
function getLicenseColor(license) {
  return licenseColors[license] || '#858585';
}

// Calculate bar width based on percentage
function getBarWidth(count, totalRepos, maxWidth = 200) {
  return Math.max(5, (count / totalRepos) * maxWidth);
}

// Helper: Generate beautiful SVG card
function renderSVG(username, topLicenses, count, theme = 'dark') {
  // Cache key for the SVG
  const cacheKey = `svg:${username}:${theme}:${JSON.stringify(topLicenses)}`;
  
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
        <stop offset="0%" stop-color="${background.gradient.start}" stop-opacity="1" />
        <stop offset="100%" stop-color="${background.gradient.end}" stop-opacity="1" />
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

      <svg y="-10" width="20" height="20" viewBox="0 0 16 16" class="github-icon">
        <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
      </svg>
      
      <text x="30" y="0" class="title">Top ${count} Licenses</text>
      <text x="30" y="20" class="subtitle">@${username}</text>
    </g>
  `;

  // Add license items
  topLicenses.forEach(([license, licenseCount], idx) => {
    const y = headerHeight + padding + (idx * itemHeight);
    const percentage = ((licenseCount / totalRepos) * 100).toFixed(2);
    const barWidth = getBarWidth(licenseCount, totalRepos, barMaxWidth);
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