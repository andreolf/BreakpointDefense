/**
 * Simple script to create placeholder app icons
 * Run: node scripts/generate-icon.js
 * 
 * For production, replace assets/icon.png with a proper designed icon
 */

const fs = require('fs');
const path = require('path');

// Simple 1x1 green PNG as placeholder (will be scaled by Expo)
// This is a minimal valid PNG
const placeholderPng = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
  0x00, 0x00, 0x00, 0x0d, // IHDR length
  0x49, 0x48, 0x44, 0x52, // IHDR
  0x00, 0x00, 0x00, 0x01, // width: 1
  0x00, 0x00, 0x00, 0x01, // height: 1
  0x08, 0x02, // bit depth: 8, color type: 2 (RGB)
  0x00, 0x00, 0x00, // compression, filter, interlace
  0x90, 0x77, 0x53, 0xde, // CRC
  0x00, 0x00, 0x00, 0x0c, // IDAT length
  0x49, 0x44, 0x41, 0x54, // IDAT
  0x08, 0xd7, 0x63, 0x10, 0xf9, 0x67, 0x00, 0x00, // compressed data (green pixel)
  0x00, 0x7c, 0x00, 0x7b, // some more data
  0xb2, 0x9c, 0x1e, 0x5b, // CRC
  0x00, 0x00, 0x00, 0x00, // IEND length
  0x49, 0x45, 0x4e, 0x44, // IEND
  0xae, 0x42, 0x60, 0x82, // CRC
]);

const assetsDir = path.join(__dirname, '..', 'assets');
const iconPath = path.join(assetsDir, 'icon.png');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Write placeholder icon
fs.writeFileSync(iconPath, placeholderPng);
console.log('Created placeholder icon at:', iconPath);
console.log('Note: Replace with a proper designed icon for production');

