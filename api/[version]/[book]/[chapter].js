const { fetchChapter, validateParams, filterVerses } = require('../../../lib/scraper');

/**
 * Vercel Serverless Function
 * Route: /api/[version]/[book]/[chapter]
 *
 * Query params:
 *   ?verse=16        → single verse
 *   ?start=1&end=4   → verse range
 *   (none)           → full chapter
 *
 * Source: Alkitab Mobile SABDA — https://alkitab.mobi/
 */
module.exports = async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  // Only GET allowed
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const { version, book, chapter } = req.query;

  // Validate
  const validationError = validateParams(version, book, chapter);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const data = await fetchChapter(version.toLowerCase(), book, chapter);

    // Filter verses based on query params
    const filtered = filterVerses(data.verses, {
      verse: req.query.verse,
      start: req.query.start,
      end: req.query.end,
    });

    const response = {
      ...data,
      verses: filtered,
    };

    // Cache at Vercel Edge for 1 hour, stale-while-revalidate for 1 day
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    return res.status(200).json(response);
  } catch (err) {
    console.error('Scraper error:', err.message);

    // If alkitab.mobi returns 404
    if (err.response && err.response.status === 404) {
      return res.status(404).json({
        error: `Passage not found: ${version}/${book}/${chapter}`,
      });
    }

    return res.status(500).json({
      error: 'Failed to fetch passage. Please try again later.',
    });
  }
};
