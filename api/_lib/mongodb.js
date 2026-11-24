import { MongoClient } from 'mongodb';

const DEFAULT_DB = process.env.MONGODB_DB || 'portfolio_cv';
const DEFAULT_COLLECTION = process.env.MONGODB_COLLECTION || 'appreciation';

function sanitizeMongoUri(rawUri) {
  const trimmed = String(rawUri || '').trim();
  if (!trimmed) return '';
  // Si en Vercel se pegó la plantilla de Atlas con <password>, quita los signos < > automáticamente
  return trimmed.replace(/^(mongodb(?:\+srv)?:\/\/[^:@/]+:)<([^>@/]+)>(@)/, '$1$2$3');
}

/**
 * Pool de conexión reutilizable entre invocaciones warm en Vercel Serverless.
 * Evita agotar el límite de conexiones en MongoDB Atlas (M0 / free tier).
 */
export async function getAppreciationCollection() {
  const uri = sanitizeMongoUri(process.env.MONGODB_URI);
  if (!uri) {
    return null;
  }

  if (!globalThis._voidPortfolioMongoPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 6000,
    });
    globalThis._voidPortfolioMongoPromise = client.connect().catch((err) => {
      globalThis._voidPortfolioMongoPromise = null;
      throw err;
    });
  }

  const client = await globalThis._voidPortfolioMongoPromise;
  return client.db(DEFAULT_DB).collection(DEFAULT_COLLECTION);
}
