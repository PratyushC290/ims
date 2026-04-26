import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("pinging cloudinary servers...");

cloudinary.api.ping()
  .then(res => console.log("✅ success! connected to cloudinary:", res))
  .catch(err => console.error("❌ failed! the real error is:", err));