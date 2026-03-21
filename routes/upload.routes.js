import express from 'express';
import { uploadCover, uploadPages, handleUploadError } from '../middleware/upload.middleware.js';
import { uploadToCloudinary, uploadMultipleToCloudinary } from '../utils/cloudinary.js';
import cloudinary, { getCloudinaryConfigStatus } from '../config/cloudinary.js';

const router = express.Router();

// Health check endpoint for Cloudinary configuration
router.get('/health', (req, res) => {
  try {
    const configStatus = getCloudinaryConfigStatus();
    const config = cloudinary.config();
    
    res.json({
      status: configStatus?.configured ? 'ok' : 'error',
      configured: configStatus?.configured || false,
      configMethod: configStatus?.method || 'unknown',
      error: configStatus?.error || null,
      cloud_name: config.cloud_name || process.env.CLOUD_NAME || 'not set',
      api_key: config.api_key ? 'set' : (process.env.API_KEY ? 'set in env but not loaded' : 'not set'),
      api_secret: config.api_secret ? 'set' : (process.env.API_SECRET ? 'set in env but not loaded' : 'not set'),
      env_vars: {
        CLOUDINARY_URL: process.env.CLOUDINARY_URL ? 'set' : 'not set',
        CLOUD_NAME: process.env.CLOUD_NAME || 'not set',
        API_KEY: process.env.API_KEY ? 'set' : 'not set',
        API_SECRET: process.env.API_SECRET ? 'set (hidden)' : 'not set'
      },
      message: configStatus?.configured 
        ? 'Cloudinary is properly configured' 
        : (configStatus?.error || 'Cloudinary is not properly configured. Please check your backend/.env file')
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Upload cover image to Cloudinary
router.post('/cover', handleUploadError(uploadCover), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      'social-offer/covers',
      `cover-${Date.now()}-${Math.round(Math.random() * 1E9)}`
    );
    
    res.status(200).json({
      message: 'Cover image uploaded successfully',
      url: result.url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to upload image to Cloudinary',
      details: error.message || 'Unknown error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

// Upload multiple page images to Cloudinary
router.post('/pages', handleUploadError(uploadPages), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Extract buffers from files
    const fileBuffers = req.files.map(file => file.buffer);
    
    // Upload all to Cloudinary
    const results = await uploadMultipleToCloudinary(
      fileBuffers,
      'social-offer/pages'
    );
    
    res.status(200).json({
      message: 'Page images uploaded successfully',
      urls: results.map(r => r.url),
      public_ids: results.map(r => r.public_id),
      count: results.length,
      details: results
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload images to Cloudinary',
      details: error.message 
    });
  }
});

export default router;
