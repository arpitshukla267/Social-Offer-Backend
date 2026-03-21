import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to .env file
const envPath = path.join(__dirname, '..', '.env');

console.log('Checking .env file...');
console.log('Expected location:', envPath);
console.log('File exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  console.log('\n.env file contents:');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  lines.forEach((line, index) => {
    // Hide sensitive values
    if (line.includes('API_SECRET') || line.includes('SECRET')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      console.log(`${index + 1}: ${key}=${value ? '***HIDDEN***' : 'NOT SET'}`);
    } else {
      console.log(`${index + 1}: ${line}`);
    }
  });
} else {
  console.log('\n.env file NOT FOUND!');
  console.log('Please create a .env file in the backend/ directory with:');
  console.log('CLOUD_NAME=dy331h8c5');
  console.log('API_KEY=733123145812611');
  console.log('API_SECRET=your_actual_api_secret_here');
}

// Load and check environment variables
dotenv.config({ path: envPath });

console.log('\nLoaded environment variables:');
console.log('CLOUDINARY_URL:', process.env.CLOUDINARY_URL ? 'SET' : 'NOT SET');
console.log('CLOUD_NAME:', process.env.CLOUD_NAME || 'NOT SET');
console.log('API_KEY:', process.env.API_KEY ? 'SET' : 'NOT SET');
console.log('API_SECRET:', process.env.API_SECRET ? 'SET' : 'NOT SET');

if (!process.env.API_SECRET && !process.env.CLOUDINARY_URL) {
  console.log('\n❌ ERROR: API_SECRET is required!');
  console.log('Please add API_SECRET=your_secret to your .env file');
} else {
  console.log('\n✅ Environment variables loaded successfully');
}
