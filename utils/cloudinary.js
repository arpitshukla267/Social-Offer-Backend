import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

/**
 * Upload a single image to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer from multer
 * @param {string} folder - The folder in Cloudinary (e.g., 'covers', 'pages')
 * @param {string} filename - Optional custom filename
 * @returns {Promise<Object>} Cloudinary upload result with secure_url
 */
export const uploadToCloudinary = (fileBuffer, folder = 'social-offer', filename = null) => {
  return new Promise((resolve, reject) => {
    if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
      return reject(new Error('Invalid file buffer provided'));
    }

    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: filename,
          resource_type: 'image',
          transformation: [
            { fetch_format: 'auto', quality: 'auto' } // Optimize images
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload stream error:', error);
            reject(new Error(`Cloudinary upload failed: ${error.message || 'Unknown error'}`));
          } else if (!result) {
            reject(new Error('Cloudinary upload returned no result'));
          } else {
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes
            });
          }
        }
      );

      // Convert buffer to stream
      const bufferStream = new Readable();
      bufferStream.push(fileBuffer);
      bufferStream.push(null);
      
      bufferStream.on('error', (err) => {
        console.error('Buffer stream error:', err);
        reject(new Error(`Stream error: ${err.message}`));
      });
      
      bufferStream.pipe(uploadStream);
    } catch (err) {
      console.error('Error creating upload stream:', err);
      reject(new Error(`Failed to create upload stream: ${err.message}`));
    }
  });
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array<Buffer>} fileBuffers - Array of file buffers
 * @param {string} folder - The folder in Cloudinary
 * @returns {Promise<Array<Object>>} Array of upload results
 */
export const uploadMultipleToCloudinary = async (fileBuffers, folder = 'social-offer') => {
  const uploadPromises = fileBuffers.map((buffer, index) => 
    uploadToCloudinary(buffer, folder, `page-${Date.now()}-${index}`)
  );
  
  return Promise.all(uploadPromises);
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The public_id of the image to delete
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete image from Cloudinary: ${error.message}`);
  }
};

/**
 * Get optimized URL for an image
 * @param {string} publicId - The public_id of the image
 * @param {Object} options - Transformation options
 * @returns {string} Optimized image URL
 */
export const getOptimizedUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    ...options
  });
};
