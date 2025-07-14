import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { forgotPassword, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await forgotPassword(email);
    if (success) {
      setIsSuccess(true);
      setMessage(
        'Password reset instructions have been sent to your email address.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white bg-opacity-95 rounded-3xl shadow-2xl p-10 space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Quên mật khẩu</h2>
          <p className="text-gray-500 mb-4">Nhập email để nhận hướng dẫn đặt lại mật khẩu.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-100 p-4 border border-red-300">
              <div className="text-sm text-red-700 font-medium">{error}</div>
            </div>
          )}
          {message && (
            <div className={`rounded-md ${isSuccess ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'} p-4`}>
              <div className={`text-sm ${isSuccess ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}`}>{message}</div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label htmlFor="email-address" className="block text-gray-700 font-semibold mb-1">Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                placeholder="Nhập email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSuccess}
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg shadow-lg hover:from-purple-600 hover:to-indigo-600 transition"
            disabled={isSuccess}
          >
            Gửi hướng dẫn đặt lại mật khẩu
          </button>
          <div className="text-center mt-4">
            <span className="text-sm text-gray-600">
              Đã nhớ mật khẩu?{' '}
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Đăng nhập
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 