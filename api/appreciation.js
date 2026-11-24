import { getAppreciationCollection } from './_lib/mongodb.js';

const DOC_ID = 'global';
const SAFE_PROJECT_ID = /^[a-z0-9_-]{1,64}$/i;

const nonNegInt = (value) => Math.max(0, Math.floor(Number(value) || 0));
const clampRating = (value) => {
  const n = Math.round(Number(value) || 0);
  return n >= 1 && n <= 5 ? n : 0;
};

function serializeDoc(doc) {
  const rawProjects =
    doc && doc.projectLikes && typeof doc.projectLikes === 'object' ? doc.projectLikes : {};
  const projectLikes = {};
  for (const [id, val] of Object.entries(rawProjects)) {
    const count = nonNegInt(val);
    if (count > 0) projectLikes[id] = count;
  }

  return {
    portfolioLikes: nonNegInt(doc?.portfolioLikes),
    ratingSum: nonNegInt(doc?.ratingSum),
    ratingsCount: nonNegInt(doc?.ratingsCount),
    projectLikes,
  };
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return typeof req.body === 'object' ? req.body : {};
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let collection;
  try {
    collection = await getAppreciationCollection();
  } catch (err) {
    console.error('[api/appreciation] MongoDB connection error:', err?.message || err);
    return res.status(503).json({ error: 'Database connection unavailable', configured: true });
  }

  if (!collection) {
    return res.status(503).json({
      error: 'MONGODB_URI is not configured',
      configured: false,
    });
  }

  try {
    if (req.method === 'GET') {
      const doc = await collection.findOne({ _id: DOC_ID });
      return res.status(200).json(serializeDoc(doc));
    }

    const body = parseBody(req);
    const type = String(body.type || '');
    const now = new Date();

    if (type === 'portfolio-like') {
      const delta = body.delta === -1 || body.liked === false ? -1 : 1;
      const result = await collection.findOneAndUpdate(
        { _id: DOC_ID },
        [
          {
            $set: {
              portfolioLikes: {
                $max: [0, { $add: [{ $ifNull: ['$portfolioLikes', 0] }, delta] }],
              },
              ratingSum: { $ifNull: ['$ratingSum', 0] },
              ratingsCount: { $ifNull: ['$ratingsCount', 0] },
              projectLikes: { $ifNull: ['$projectLikes', {}] },
              updatedAt: now,
            },
          },
        ],
        { upsert: true, returnDocument: 'after' }
      );

      return res.status(200).json(serializeDoc(result));
    }

    if (type === 'portfolio-rating') {
      const prevRating = clampRating(body.previousRating);
      const nextRating = clampRating(body.rating);
      const hadRating = prevRating > 0;
      const hasRating = nextRating > 0;
      const countDelta = hasRating && !hadRating ? 1 : !hasRating && hadRating ? -1 : 0;
      const sumDelta = nextRating - prevRating;

      const result = await collection.findOneAndUpdate(
        { _id: DOC_ID },
        [
          {
            $set: {
              portfolioLikes: { $ifNull: ['$portfolioLikes', 0] },
              ratingSum: {
                $max: [0, { $add: [{ $ifNull: ['$ratingSum', 0] }, sumDelta] }],
              },
              ratingsCount: {
                $max: [0, { $add: [{ $ifNull: ['$ratingsCount', 0] }, countDelta] }],
              },
              projectLikes: { $ifNull: ['$projectLikes', {}] },
              updatedAt: now,
            },
          },
        ],
        { upsert: true, returnDocument: 'after' }
      );

      return res.status(200).json(serializeDoc(result));
    }

    if (type === 'project-like') {
      const projectId = String(body.projectId || '').trim();
      if (!SAFE_PROJECT_ID.test(projectId)) {
        return res.status(400).json({ error: 'Invalid projectId' });
      }
      const delta = body.delta === -1 || body.liked === false ? -1 : 1;
      const fieldPath = `$projectLikes.${projectId}`;

      const result = await collection.findOneAndUpdate(
        { _id: DOC_ID },
        [
          {
            $set: {
              portfolioLikes: { $ifNull: ['$portfolioLikes', 0] },
              ratingSum: { $ifNull: ['$ratingSum', 0] },
              ratingsCount: { $ifNull: ['$ratingsCount', 0] },
              projectLikes: {
                $mergeObjects: [
                  { $ifNull: ['$projectLikes', {}] },
                  {
                    [projectId]: {
                      $max: [0, { $add: [{ $ifNull: [fieldPath, 0] }, delta] }],
                    },
                  },
                ],
              },
              updatedAt: now,
            },
          },
        ],
        { upsert: true, returnDocument: 'after' }
      );

      return res.status(200).json(serializeDoc(result));
    }

    return res.status(400).json({ error: 'Unsupported appreciation event type' });
  } catch (err) {
    console.error('[api/appreciation] Query error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to update appreciation state' });
  }
}
