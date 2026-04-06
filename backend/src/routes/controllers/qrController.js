const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const { Restaurant, Table } = require('../../models');
const mongoose = require('mongoose');

/**
 * Generate QR codes for all restaurant tables
 * POST /api/restaurant/qr-generate
 * Body: { format: 'preview' | 'svg' | 'pdf' }
 */
const generateTableQRCodes = async (req, res) => {
  try {
    const { restaurantId } = req;
    const { format = 'preview' } = req.body;

    // Fetch restaurant and its tables
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const tables = await Table.find({ restaurantId, isActive: true }).sort({ tableNo: 1 });
    
    if (tables.length === 0) {
      return res.status(400).json({ message: 'No tables found. Please add tables first.' });
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const qrCodes = [];

    for (const table of tables) {
      // SMART ID: Use the permanent qrId in the URL
      const qrUrl = `${baseUrl}/s/${table.qrId}`;
      
      try {
        // Generate SVG string for preview/web
        const svgString = await QRCode.toString(qrUrl, {
          type: 'image/svg+xml',
          width: 300,
          margin: 2,
        });

        qrCodes.push({
          tableNo: table.tableNo,
          label: table.label,
          url: qrUrl,
          svg: svgString
        });
      } catch (error) {
        console.error(`Error generating QR for table ${table.tableNo}:`, error);
      }
    }

    if (format === 'preview') {
      return res.status(200).json({
        message: 'QR codes generated for preview',
        data: {
          restaurantName: restaurant.name,
          qrCodes
        }
      });
    }

    if (format === 'svg') {
      return res.status(200).json({
        message: 'QR codes generated as SVG',
        data: {
          restaurantName: restaurant.name,
          qrCodes: qrCodes.map(qr => ({
            tableNo: qr.tableNo,
            filename: `${restaurant.slug}-table-${qr.tableNo}.svg`,
            svg: qr.svg
          }))
        }
      });
    }

    if (format === 'pdf') {
      return generateQRPDF(res, restaurant.name, restaurant.slug, qrCodes);
    }
  } catch (error) {
    console.error('Generate QR codes error:', error);
    return res.status(500).json({ message: 'Failed to generate QR codes' });
  }
};

/**
 * Refined PDF Generation with actual QR Images
 */
const generateQRPDF = async (res, restaurantName, slug, qrCodes) => {
  try {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${slug}-qrs.pdf"`);
    doc.pipe(res);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text(restaurantName, { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Table QR Identity Grid', { align: 'center' });
    doc.moveDown(2);

    const qrSize = 140;
    const margin = 50;
    const itemsPerRow = 3;
    const rowHeight = 220;

    for (let i = 0; i < qrCodes.length; i++) {
      const qr = qrCodes[i];
      const col = i % itemsPerRow;
      const row = Math.floor(i / itemsPerRow) % 3; // 3 rows per page

      if (i > 0 && i % 9 === 0) {
        doc.addPage();
      }

      const x = margin + col * (qrSize + 40);
      const y = 120 + row * rowHeight;

      // Generate PNG buffer for PDF embedding
      const pngBuffer = await QRCode.toBuffer(qr.url, {
        width: 400,
        margin: 2
      });

      // Draw Box
      doc.roundedRect(x - 10, y - 10, qrSize + 20, rowHeight - 20, 15)
         .lineWidth(0.5)
         .stroke('#E2E8F0');

      // Embed QR Image
      doc.image(pngBuffer, x, y, { width: qrSize });

      // Labels
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#1E293B')
         .text(`${qr.label}`, x, y + qrSize + 10, { width: qrSize, align: 'center' });
      
      doc.fontSize(8).font('Helvetica').fillColor('#64748B')
         .text(`Scan to Browse Menu`, x, y + qrSize + 25, { width: qrSize, align: 'center' });
    }

    doc.end();
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).send('Finalizing PDF failed');
  }
};

const getTableQRPreview = async (req, res) => {
  // Simple wrapper as placeholder for existing route
  return res.status(200).json({ message: 'Individual preview deprecated. Use bulk preview.' });
};

module.exports = {
  generateTableQRCodes,
  getTableQRPreview
};
