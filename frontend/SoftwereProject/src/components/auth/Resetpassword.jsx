import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/Alert';
import emailjs from 'emailjs-com';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (email.trim() === "") {
      setMessage({ text: 'Email address cannot be empty.', type: 'error' });
      setIsLoading(false);
      return;
    }

    try {
      // Initialize EmailJS (you should do this in your app's entry point)
      // emailjs.init("YOUR_PUBLIC_KEY");
      emailjs.init("ShFkAn-KbgUjwd-k9"); 
      const resetLink = `http://localhost:3000/reset_password/${encodeURIComponent(email)}`;
      
      await emailjs.send(
        'service_zg1d4gv',
        'template_egzjkgm',
        { 
          reset_link: resetLink,
          mail: email 
        }
      );

      setMessage({ 
        text: 'Reset password link has been sent to your email!',
        type: 'success'
      });
    } catch (error) {
      setMessage({ 
        text: 'Failed to send reset link. Please try again later.',
        type: 'error'

      });
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-blue-100 mb-4">
  <Mail className="h-8 w-8 text-blue-600" />
</div>
            <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
            <p className="text-gray-500">
              No worries! Enter your email and we'll send you reset instructions.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                placeholder="Enter your email"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium
                ${isLoading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                } transition duration-200 transform hover:translate-y-[-1px] active:translate-y-0`}
            >
              {isLoading ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Message Alert */}
          {message.text && (
            <Alert className={`${
              message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <AlertDescription className={`${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {/* Back to Login Link */}
          <div className="text-center">
            <a 
              href="/login" 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;