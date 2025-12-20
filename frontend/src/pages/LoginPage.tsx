import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, Copy, Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { sendOTP, verifyOTP, clearError } from '@/store/slices/authSlice';
import { Error, Success } from '@/components';

type AuthStep = 'phone' | 'otp';

/**
 * Admin Login Page
 * Two-step OTP authentication:
 * 1. Enter phone number -> Send OTP
 * 2. Enter OTP -> Verify and authenticate
 */
export const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const { loading, error, isAuthenticated, otpSent, demoOTP } = useAppSelector(
    (state) => state.auth
  );

  // Local state
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Handle OTP sent
  useEffect(() => {
    if (otpSent && step === 'phone') {
      setShowOTPModal(true);
      setStep('otp');
      setSuccessMessage('OTP sent successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  }, [otpSent, step]);

  // Validate phone number (10 digits)
  const validatePhone = (phoneInput: string): boolean => {
    const cleaned = phoneInput.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setPhoneError('Phone number must be 10 digits');
      return false;
    }
    setPhoneError('');
    return true;
  };

  // Validate OTP (6 digits)
  const validateOTP = (otpInput: string): boolean => {
    if (otpInput.length !== 6 || !/^\d+$/.test(otpInput)) {
      setOtpError('OTP must be 6 digits');
      return false;
    }
    setOtpError('');
    return true;
  };

  // Handle send OTP
  const handleSendOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validatePhone(phone)) return;

    // Clean phone number
    const cleanedPhone = phone.replace(/\D/g, '');
    dispatch(clearError());
    await dispatch(sendOTP(cleanedPhone));
  };

  // Handle verify OTP
  const handleVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateOTP(otp)) return;

    dispatch(clearError());
    const cleanedPhone = phone.replace(/\D/g, '');
    await dispatch(verifyOTP({ phone: cleanedPhone, otp }));
  };

  // Handle back to phone step
  const handleBackToPhone = () => {
    setStep('phone');
    setOtp('');
    setOtpError('');
    setShowOTPModal(false);
    dispatch(clearError());
  };

  // Handle copy OTP to clipboard
  const handleCopyOTP = () => {
    if (demoOTP) {
      navigator.clipboard.writeText(demoOTP);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-orange-50 flex items-center justify-center p-4">
      {/* OTP Modal for Demo */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your OTP Code</h3>
            <p className="text-gray-600 mb-6">
              Here's your One-Time Password for demo purposes. Copy it and paste in the verification field.
            </p>
            
            {/* OTP Display Box */}
            <div className="bg-indigo-50 border-2 border-indigo-300 rounded-lg p-6 mb-6">
              <p className="text-center text-4xl font-bold font-mono text-indigo-600 tracking-widest">
                {demoOTP || '......'}
              </p>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopyOTP}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2 mb-4"
            >
              {copied ? (
                <>
                  <Check size={20} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={20} />
                  Copy OTP
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={() => setShowOTPModal(false)}
              className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Done, I've Copied It
            </button>

            <p className="text-center text-xs text-gray-500 mt-4">
              This popup is for demo purposes only
            </p>
          </div>
        </div>
      )}
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            RestaurantGPT
          </h1>
          <p className="text-gray-600">Admin Portal</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Error Alert */}
          {error && (
            <Error
              message={error}
              onClose={() => dispatch(clearError())}
              className="mb-6"
            />
          )}

          {/* Success Alert */}
          {successMessage && (
            <Success message={successMessage} className="mb-6" />
          )}

          {/* Phone Input Step */}
          {step === 'phone' && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type="tel"
                    placeholder="10-digit phone number"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setPhoneError('');
                    }}
                    disabled={loading}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      phoneError ? 'border-red-500' : 'border-gray-300'
                    } ${loading ? 'bg-gray-50' : ''}`}
                  />
                </div>
                {phoneError && (
                  <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !phone}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
            </form>
          )}

          {/* OTP Input Step */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OTP Code
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="6-digit OTP"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setOtpError('');
                    }}
                    maxLength={6}
                    disabled={loading}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-2xl tracking-widest ${
                      otpError ? 'border-red-500' : 'border-gray-300'
                    } ${loading ? 'bg-gray-50' : ''}`}
                  />
                </div>
                {otpError && (
                  <p className="text-red-500 text-sm mt-1">{otpError}</p>
                )}
                <p className="text-gray-600 text-sm mt-2">
                  Copy the OTP from the popup above and paste it here
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !otp || otp.length !== 6}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>

              <button
                type="button"
                onClick={handleBackToPhone}
                disabled={loading}
                className="w-full text-indigo-600 py-2 font-medium hover:text-indigo-700 transition disabled:text-gray-400"
              >
                ← Change Phone Number
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 mt-8">
            <p>Secure login powered by OTP authentication</p>
          </div>
        </div>

        {/* Demo Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6 text-center text-sm text-green-700">
            <p>✨ Demo Mode - Mock OTP System</p>
            <p>Use any 10-digit phone number. OTP will appear in a popup automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
