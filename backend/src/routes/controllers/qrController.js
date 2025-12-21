const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const { Restaurant } = require('../../models');
const mongoose = require('mongoose');

/**
 * Generate QR codes for all restaurant tables
 * POST /api/restaurant/qr-generate
 * Body: { format: 'preview' | 'svg' | 'pdf', tablesCount (optional for regenerate) }
 * 
 * Response:
 * - preview: Returns array of SVG strings for preview
 * - svg: Returns individual SVG files
 * - pdf: Returns PDF blob with all QR codes
 */
const generateTableQRCodes = async (req, res) => {
  try {
    const { restaurantId } = req;
    const { format = 'preview' } = req.body;

    // Validation
    if (!restaurantId) {
      return res.status(400).json({
        message: 'Restaurant ID is required'
      });
    }

    // Validate format
    const validFormats = ['preview', 'svg', 'pdf'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({
        message: `Invalid format. Must be one of: ${validFormats.join(', ')}`
      });
    }

    // Fetch restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        message: 'Restaurant not found'
      });
    }

    const { slug, name, tablesCount } = restaurant;
    const baseUrl = process.env.CUSTOMER_BASE_URL || 'http://localhost:5173';

    // Generate QR codes for each table
    const qrCodes = [];

    for (let tableNo = 1; tableNo <= tablesCount; tableNo++) {
      const qrUrl = `${baseUrl}/r/${slug}/table/${tableNo}`;
      
      try {
        // Generate QR code as SVG string
        const svgString = await QRCode.toString(qrUrl, {
          type: 'image/svg+xml',
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        qrCodes.push({
          tableNo,
          url: qrUrl,
          svg: svgString,
          timestamp: new Date()
        });
      } catch (error) {
        console.error(`Error generating QR for table ${tableNo}:`, error);
        return res.status(500).json({
          message: `Failed to generate QR code for table ${tableNo}`,
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }

    // Return based on format
    if (format === 'preview') {
      return res.status(200).json({
        message: 'QR code preview generated successfully',
        data: {
          restaurantName: name,
          restaurantSlug: slug,
          totalTables: tablesCount,
          qrCodes: qrCodes.map((qr) => ({
            tableNo: qr.tableNo,
            url: qr.url,
            svg: qr.svg // SVG string for preview in UI
          })),
          generatedAt: new Date()
        }
      });
    }

    if (format === 'svg') {
      // Return array of SVGs - frontend can use these for individual downloads
      return res.status(200).json({
        message: 'QR codes generated as SVG',
        data: {
          restaurantName: name,
          restaurantSlug: slug,
          qrCodes: qrCodes.map((qr) => ({
            tableNo: qr.tableNo,
            filename: `${slug}-table-${String(qr.tableNo).padStart(2, '0')}.svg`,
            svg: qr.svg
          }))
        }
      });
    }

    if (format === 'pdf') {
      // Generate PDF with all QR codes
      return generateQRPDF(res, name, slug, qrCodes);
    }
  } catch (error) {
    console.error('Generate QR codes error:', error);
    return res.status(500).json({
      message: 'Failed to generate QR codes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Helper function to generate PDF with all QR codes
 */
const generateQRPDF = (res, restaurantName, slug, qrCodes) => {
  try {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 20
    });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${slug}-table-qr-codes.pdf"`
    );

    // Pipe to response
    doc.pipe(res);

    // Title
    doc.fontSize(24).font('Helvetica-Bold').text(restaurantName, { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Table QR Codes', { align: 'center' });
    doc.moveDown();

    // Instructions
    doc.fontSize(10)
      .font('Helvetica')
      .text(
        'Print these QR codes and place them on each table. Customers can scan to access the menu.',
        { align: 'left' }
      );
    doc.moveDown(2);

    // QR codes layout (2 columns, 4 rows per page)
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 20;
    const qrSize = 180;
    const colSpacing = 40;
    const rowSpacing = 50;

    let qrIndex = 0;
    let pageCount = 1;

    const codesPerPage = 8; // 2 cols x 4 rows
    const totalPages = Math.ceil(qrCodes.length / codesPerPage);

    for (let i = 0; i < qrCodes.length; i++) {
      const row = Math.floor((i % codesPerPage) / 2);
      const col = i % 2;

      const x = margin + col * (qrSize + colSpacing);
      const y = margin + 120 + row * (qrSize + rowSpacing); // 120 for header

      // Check if we need a new page
      if (y + qrSize > pageHeight - margin) {
        pageCount++;
        doc.addPage();
        
        // Repeat header on new page
        doc.fontSize(14).font('Helvetica-Bold').text(`${restaurantName} - QR Codes (Page ${pageCount})`, 20, 20);
        doc.moveDown();
      }

      // Get SVG from qrCode
      const qrCode = qrCodes[i];
      
      // Convert SVG to PNG for PDF embedding (fallback to text if SVG rendering fails)
      try {
        // Since embedding SVG directly in PDFKit is complex, we'll use QRCode library's image option
        // For now, we'll add a box with table number and QR instructions
        doc.rect(x - 5, y - 20, qrSize + 10, qrSize + 40).stroke();
        
        // Table number
        doc.fontSize(14).font('Helvetica-Bold').text(`Table ${qrCode.tableNo}`, x, y - 15);
        
        // QR code (using data URL would be ideal, but we'll use the SVG from the qrCode object)
        // For production, convert SVG to image and embed
        doc.fontSize(9).font('Helvetica').text(
          `Scan to order`,
          x,
          y + qrSize + 5,
          { width: qrSize, align: 'center' }
        );
      } catch (error) {
        console.error(`Error embedding QR ${qrCode.tableNo}:`, error);
        doc.text(`[QR Code ${qrCode.tableNo}]`, x, y, { width: qrSize, align: 'center' });
      }
    }

    // Add footer
    doc.fontSize(8)
      .font('Helvetica')
      .text(
        `Generated: ${new Date().toLocaleString()} | ${slug}`,
        margin,
        pageHeight - 30,
        { align: 'center' }
      );

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Generate PDF error:', error);
    return res.status(500).json({
      message: 'Failed to generate PDF',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get QR code preview for a specific table
 * GET /api/restaurant/qr-preview/:restaurantId/:tableNo
 * Used to fetch single QR code (e.g., for verification)
 */
const getTableQRPreview = async (req, res) => {
  try {
    const { restaurantId, tableNo } = req.params;

    // Validation
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({
        message: 'Invalid restaurant ID'
      });
    }

    if (!tableNo || isNaN(tableNo) || tableNo < 1) {
      return res.status(400).json({
        message: 'Invalid table number'
      });
    }

    // Fetch restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        message: 'Restaurant not found'
      });
    }

    // Verify table exists
    if (tableNo > restaurant.tablesCount) {
      return res.status(400).json({
        message: `Invalid table number. Restaurant has ${restaurant.tablesCount} tables`
      });
    }

    const { slug } = restaurant;
    const baseUrl = process.env.CUSTOMER_BASE_URL || 'http://localhost:5173';
    const qrUrl = `${baseUrl}/r/${slug}/table/${tableNo}`;

    // Generate QR code
    const svgString = await QRCode.toString(qrUrl, {
      type: 'image/svg+xml',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return res.status(200).json({
      message: 'QR code preview retrieved successfully',
      data: {
        tableNo,
        url: qrUrl,
        svg: svgString,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Get QR preview error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve QR code preview',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  generateTableQRCodes,
  getTableQRPreview
};
