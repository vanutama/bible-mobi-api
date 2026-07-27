const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

/**
 * Load chapter data from a static JSON file.
 * Path pattern: data/{version}/{book}/{chapter}.json
 *
 * @param {string} version
 * @param {string} book
 * @param {number|string} chapter
 * @returns {object|null} Parsed JSON data, or null if file doesn't exist
 */
function loadFromFile(version, book, chapter) {
  const filePath = path.join(process.cwd(), 'data', version, book, `${chapter}.json`);
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error(`Failed to read static file ${filePath}:`, err.message);
  }
  return null;
}

/**
 * Get chapter data — tries static JSON first, then scrapes alkitab.mobi.
 *
 * @param {string} version
 * @param {string} book
 * @param {number|string} chapter
 * @returns {Promise<{verses: Array, book: string, chapter: number, version: string, source: string}>}
 */
async function getChapter(version, book, chapter) {
  // 1. Try static JSON file
  const cached = loadFromFile(version, book, chapter);
  if (cached) {
    return { ...cached, source: 'static' };
  }

  // 2. Fallback: scrape alkitab.mobi
  const scraped = await fetchChapter(version, book, chapter);
  return { ...scraped, source: 'scrape' };
}

/**
 * Valid Bible versions supported by alkitab.mobi
 */
const VALID_VERSIONS = new Set([
  'av', 'net', 'nkjv', 'amp', 'esv', 'niv', 'bbe',
  'tb', 'jawa', 'sunda', 'toba', 'makasar', 'bali',
  'lampung', 'simalungun', 'nias', 'aceh', 'mentawai',
  'mamasa', 'berik', 'manggarai', 'sabu', 'kupang',
  'abun', 'meyah', 'uma', 'yawa', 'gorontalo',
  'barantak', 'bambam', 'mongondow', 'aralle', 'napu',
  'sangir', 'taa', 'rote', 'galela', 'yali', 'tabaru', 'karo',
]);

/**
 * Fetch and parse a Bible chapter from alkitab.mobi.
 *
 * @param {string} version  - Bible version code (e.g. "tb", "niv")
 * @param {string} book     - Book abbreviation (e.g. "Yoh", "Kej")
 * @param {number} chapter  - Chapter number
 * @returns {Promise<{verses: Array, book: string, chapter: number, version: string}>}
 */
async function fetchChapter(version, book, chapter) {
  const url = `https://alkitab.mobi/${version}/${book}/${chapter}`;

  const { data } = await axios.get(url, {
    timeout: 15000,
    headers: {
      'User-Agent': 'BibleMobiAPI/1.0',
    },
  });

  const $ = cheerio.load(data);
  const items = [];
  let lastVerse = 0;

  $('p').each((i, el) => {
    const $el = $(el);

    // Skip hidden / loading / error elements
    if (
      $el.attr('hidden') === 'hidden' ||
      $el.hasClass('loading') ||
      $el.hasClass('error')
    ) {
      return;
    }

    let content = $el.find('[data-begin]').first().text();
    const title = $el.find('.paragraphtitle').first().text();
    let verse = $el.find('.reftext').children().first().text();
    let type = null;

    verse = verse ? parseInt(verse, 10) : 0;

    // If no explicit content found, use the paragraph text (minus reftext)
    if (!title && !content) {
      $el.find('.reftext').remove();
      content = $el.text().trim();
    }

    if (title) {
      type = 'title';
      content = title;
      verse = lastVerse + 1;
    } else if (content) {
      type = 'content';
      lastVerse = verse;
    }

    if (type) {
      items.push({
        content,
        type,
        verse,
        order: i,
      });
    }
  });

  return {
    verses: items,
    book,
    chapter: Number(chapter),
    version,
  };
}

/**
 * Validate request parameters.
 * Returns an error string if invalid, or null if valid.
 */
function validateParams(version, book, chapter) {
  if (!version || !book || !chapter) {
    return 'Missing required parameters: version, book, and chapter are all required.';
  }

  if (!VALID_VERSIONS.has(version.toLowerCase())) {
    return `Invalid version "${version}". Valid versions: ${[...VALID_VERSIONS].join(', ')}`;
  }

  const chapterNum = parseInt(chapter, 10);
  if (isNaN(chapterNum) || chapterNum < 1) {
    return `Invalid chapter "${chapter}". Must be a positive integer.`;
  }

  return null;
}

/**
 * Filter verses based on query parameters.
 *
 * @param {Array}  verses - Full list of verses from a chapter
 * @param {Object} query  - { verse, start, end }
 * @returns {Array} Filtered verses
 */
function filterVerses(verses, { verse, start, end }) {
  // Single verse
  if (verse !== undefined) {
    const v = parseInt(verse, 10);
    return verses.filter((item) => item.verse === v);
  }

  // Verse range
  if (start !== undefined && end !== undefined) {
    const s = parseInt(start, 10);
    const e = parseInt(end, 10);
    return verses.filter((item) => item.verse >= s && item.verse <= e);
  }

  // Start only (from start to end of chapter)
  if (start !== undefined) {
    const s = parseInt(start, 10);
    return verses.filter((item) => item.verse >= s);
  }

  // No filter — return all
  return verses;
}

module.exports = {
  getChapter,
  fetchChapter,
  loadFromFile,
  validateParams,
  filterVerses,
  VALID_VERSIONS,
};
