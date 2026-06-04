import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;
const CLOUDINARY_NAME = process.env.CLOUDINARY_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_SECRET = process.env.CLOUDINARY_SECRET;
const JWT_SECRET = String(process.env.JWT_SECRET);
const NODE_ENV = process.env.NODE_ENV;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const REDIS_URL = process.env.REDIS_URL;

if (!GOOGLE_API_KEY) {
  console.error("Error: GOOGLE_API_KEY environment variable is not set");
  process.exit(1);
}

if (!JWT_SECRET) {
  console.error("Error: JWT_SECRET environment variable is not set");
  process.exit(1);
}
if (!NODE_ENV) {
  console.error("Error: NODE_ENV environment variable is not set");
  process.exit(1);
}
if (!DATABASE_URL) {
  console.error("Error: DATABASE_URL environment variable is not set");
  process.exit(1);
}

if (!REDIS_URL) {
  console.error("Error: REDIS_URL environment variable is not set");
  process.exit(1);
}

if (!CLOUDINARY_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_SECRET) {
  console.error("Error: Cloudinary environment variables are not set");
  process.exit(1);
}

console.log(`PORT: ${PORT}`);
if (!PORT) {
  console.error("Error: PORT environment variable is not set");
}

export {
  PORT,
  DATABASE_URL,
  CLOUDINARY_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_SECRET,
  JWT_SECRET,
  NODE_ENV,
  REDIS_URL,
  GOOGLE_API_KEY
};
