import { useState, useEffect } from 'react';
import { useAppSelector } from '@/hooks/useRedux';
import { Download, Eye, Printer, RefreshCw } from 'lucide-react';
import { Error, Success, Loading } from '@/components';
import axios from 'axios';

/**
 * QR Management Page
 * Allows admin to generate, preview, and download QR codes for all tables
 */
export const QRManagementPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [format, setFormat] = useState<'preview' | 'svg' | 'pdf'>('preview');

  const restaurant = useAppSelector((state) => state.restaurant.currentRestaurant);
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Generate QR codes
  const handleGenerateQR = async (selectedFormat: 'preview' | 'svg' | 'pdf') => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await axios.post(
        `${API_URL}/restaurant/qr-generate`,
        { format: selectedFormat },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      if (selectedFormat === 'pdf') {
        // Download PDF directly
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${restaurant?.slug}-table-qr-codes.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setSuccess(`PDF downloaded successfully!`);
      } else if (selectedFormat === 'svg') {
        // Handle SVG download
        const codes = response.data.data.qrCodes;
        codes.forEach((qrCode: any) => {
          const blob = new Blob([qrCode.svg], { type: 'image/svg+xml' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = qrCode.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        });

        setSuccess(`${codes.length} QR codes downloaded successfully!`);
      } else {
        // Preview mode
        setQrCodes(response.data.data.qrCodes);
        setShowPreview(true);
        setSuccess('QR codes generated successfully! Ready for preview.');
      }

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Failed to generate QR codes';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Download individual QR as image
  const downloadQRAsImage = async (tableNo: number, svg: string) => {
    try {
      // Convert SVG to PNG using canvas (simple method)
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');

      // Create image from SVG
      const img = new Image();
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${restaurant?.slug}-table-${String(tableNo).padStart(2, '0')}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        });
        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download QR code');
    }
  };

  // Download SVG directly
  const downloadQRAsSVG = (tableNo: number, svg: string) => {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${restaurant?.slug}-table-${String(tableNo).padStart(2, '0')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">QR Code Management</h1>
        <p className="text-slate-600">Generate and manage QR codes for your table ordering system</p>
      </div>

      {/* Error & Success Messages */}
      {error && <Error message={error} />}
      {success && <Success message={success} />}

      {/* Restaurant Info Card */}
      {restaurant && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Restaurant Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-600 font-medium">Name</p>
              <p className="text-slate-900 font-semibold">{restaurant.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Slug</p>
              <p className="text-slate-900 font-semibold">{restaurant.slug}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Total Tables</p>
              <p className="text-2xl font-bold text-slate-900">{restaurant.tablesCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Generation Options */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Generate QR Codes</h2>
        <p className="text-slate-600 mb-6">
          Generate QR codes for all {restaurant?.tablesCount} tables. Each QR code links to your
          restaurant's customer ordering interface.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Preview Button */}
          <button
            onClick={() => handleGenerateQR('preview')}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Eye size={20} />
                Preview QR Codes
              </>
            )}
          </button>

          {/* Download SVG Button */}
          <button
            onClick={() => handleGenerateQR('svg')}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Download size={20} />
                Download SVG
              </>
            )}
          </button>

          {/* Download PDF Button */}
          <button
            onClick={() => handleGenerateQR('pdf')}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Printer size={20} />
                Download PDF
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-4">
          💡 <strong>Tip:</strong> PDF is best for printing all codes at once. SVG is ideal for
          customization. Preview to see all codes first.
        </p>
      </div>

      {/* QR Code Preview Grid */}
      {showPreview && qrCodes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">QR Code Preview</h2>
            <button
              onClick={() => setShowPreview(false)}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Hide
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {qrCodes.map((qrCode) => (
              <div
                key={qrCode.tableNo}
                className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Table Header */}
                <h3 className="text-center font-semibold text-slate-900 mb-3">
                  Table {qrCode.tableNo}
                </h3>

                {/* QR Code */}
                <div className="bg-white border-2 border-slate-200 rounded p-2 mb-3 flex items-center justify-center">
                  <div dangerouslySetInnerHTML={{ __html: qrCode.svg }} />
                </div>

                {/* Download Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadQRAsImage(qrCode.tableNo, qrCode.svg)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 text-sm rounded hover:bg-blue-100 transition-colors"
                    title="Download as PNG"
                  >
                    PNG
                  </button>
                  <button
                    onClick={() => downloadQRAsSVG(qrCode.tableNo, qrCode.svg)}
                    className="flex-1 px-3 py-2 bg-green-50 text-green-600 text-sm rounded hover:bg-green-100 transition-colors"
                    title="Download as SVG"
                  >
                    SVG
                  </button>
                </div>

                {/* QR URL (for reference) */}
                <p className="text-xs text-slate-500 mt-2 text-center break-all">
                  {qrCode.url}
                </p>
              </div>
            ))}
          </div>

          {/* Regenerate Button */}
          <button
            onClick={() => handleGenerateQR('preview')}
            className="mt-6 flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={16} />
            Regenerate
          </button>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How to Use</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Generate QR codes using one of the options above</li>
          <li>Download PDF or individual SVG files</li>
          <li>Print the QR codes and laminate them</li>
          <li>Place one QR code on each table (face-up recommended)</li>
          <li>Customers scan with their mobile phone camera</li>
          <li>They land on the menu page for that specific table</li>
        </ol>
      </div>
    </div>
  );
};

export default QRManagementPage;
