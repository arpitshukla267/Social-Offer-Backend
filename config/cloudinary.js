import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Normalize environment variable names (handle case variations)
// Check for both uppercase and mixed case versions
const getEnvVar = (upperName, ...altNames) => {
  // First check the standard uppercase name
  if (process.env[upperName]) return process.env[upperName];
  // Then check alternative case variations
  for (const altName of altNames) {
    if (process.env[altName]) return process.env[altName];
  }
  // Check all possible case variations in process.env
  const upper = upperName.toUpperCase();
  for (const key in process.env) {
    if (key.toUpperCase() === upper) {
      return process.env[key];
    }
  }
  return null;
};

const CLOUDINARY_URL = getEnvVar('CLOUDINARY_URL');
const CLOUD_NAME = getEnvVar('CLOUD_NAME', 'Cloud_name', 'CLOUD_NAME');
const API_KEY = getEnvVar('API_KEY', 'API_key', 'Api_key', 'api_key');
const API_SECRET = getEnvVar('API_SECRET', 'API_secret', 'Api_secret', 'api_secret');

// Debug: Log environment variables (without exposing secrets)
console.log('Cloudinary Config Check:');
console.log('CLOUDINARY_URL:', CLOUDINARY_URL ? 'SET' : 'NOT SET');
console.log('CLOUD_NAME:', CLOUD_NAME || 'NOT SET');
console.log('API_KEY:', API_KEY ? 'SET' : 'NOT SET');
console.log('API_SECRET:', API_SECRET ? 'SET' : 'NOT SET');

// Configure Cloudinary
// Priority: CLOUDINARY_URL > individual config variables
let cloudinaryConfig = null;

if (CLOUDINARY_URL) {
  // Use the full Cloudinary URL if provided
  try {
    // Validate CLOUDINARY_URL format
    const url = CLOUDINARY_URL.trim();
    if (!url.startsWith('cloudinary://')) {
      throw new Error('CLOUDINARY_URL must start with cloudinary://');
    }
    
    // Try to configure with URL
    cloudinary.config(url);
    
    // Verify configuration was successful by checking if api_key is set
    const config = cloudinary.config();
    if (!config.api_key) {
      throw new Error('CLOUDINARY_URL was parsed but api_key is missing. URL format may be incorrect.');
    }
    
    cloudinaryConfig = { method: 'CLOUDINARY_URL', configured: true };
    console.log('Cloudinary configured using CLOUDINARY_URL');
    console.log(`  Cloud Name: ${config.cloud_name || 'unknown'}`);
    console.log(`  API Key: ${config.api_key ? config.api_key.substring(0, 4) + '...' : 'missing'}`);
  } catch (error) {
    console.error('Error configuring Cloudinary with CLOUDINARY_URL:', error.message);
    console.error('CLOUDINARY_URL format:', CLOUDINARY_URL.replace(/:[^:@]+@/, ':***@')); // Hide secret
    console.log('Falling back to individual environment variables...');
    cloudinaryConfig = { method: 'CLOUDINARY_URL', configured: false, error: error.message };
    // Don't return here - fall through to individual config
  }
}

// If CLOUDINARY_URL failed or wasn't set, use individual variables
if (!cloudinaryConfig || !cloudinaryConfig.configured) {
  // Use individual configuration variables
  // Trim whitespace and handle empty strings
  const cloud_name = (CLOUD_NAME || 'dy331h8c5').trim();
  const api_key = (API_KEY || '733123145812611').trim();
  const api_secret = API_SECRET ? API_SECRET.trim() : null;

  // Validate all required values
  if (!api_secret || api_secret === '') {
    console.error('ERROR: API_SECRET is not set in .env file');
    console.error('Please add API_SECRET=your_secret to your backend/.env file');
    if (!cloudinaryConfig) {
      cloudinaryConfig = { method: 'individual', configured: false, error: 'API_SECRET missing' };
    }
  } else if (!api_key || api_key === '') {
    console.error('ERROR: API_KEY is not set in .env file');
    if (!cloudinaryConfig) {
      cloudinaryConfig = { method: 'individual', configured: false, error: 'API_KEY missing' };
    }
  } else if (!cloud_name || cloud_name === '') {
    console.error('ERROR: CLOUD_NAME is not set in .env file');
    if (!cloudinaryConfig) {
      cloudinaryConfig = { method: 'individual', configured: false, error: 'CLOUD_NAME missing' };
    }
  } else {
    try {
      cloudinary.config({
        cloud_name: cloud_name,
        api_key: api_key,
        api_secret: api_secret,
        secure: true, // Use HTTPS
      });
      
      // Verify configuration
      const config = cloudinary.config();
      if (!config.api_key) {
        throw new Error('Configuration failed: api_key not set after config()');
      }
      
      cloudinaryConfig = { method: 'individual', configured: true };
      console.log('Cloudinary configured using individual environment variables');
      console.log(`  Cloud Name: ${cloud_name}`);
      console.log(`  API Key: ${api_key.substring(0, 4)}...`);
    } catch (error) {
      console.error('Error configuring Cloudinary:', error.message);
      if (!cloudinaryConfig) {
        cloudinaryConfig = { method: 'individual', configured: false, error: error.message };
      }
    }
  }
}

// Export config status for health check
export const getCloudinaryConfigStatus = () => cloudinaryConfig;

export default cloudinary;
