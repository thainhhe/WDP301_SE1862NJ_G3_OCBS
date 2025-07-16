import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { resettoken } = useParams();
  const navigate = useNavigate();
  const { resetPassword, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError(
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
      );
      return;
    }

    const success = await resetPassword(password, resettoken);
    if (success) {
      navigate('/login', {
        state: { message: 'Password has been reset successfully. Please login.' },
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white bg-opacity-95 rounded-3xl shadow-2xl p-10 space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Đặt lại mật khẩu</h2>
          <p className="text-gray-500 mb-4">Nhập mật khẩu mới cho tài khoản của bạn.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {(error || passwordError) && (
            <div className="rounded-md bg-red-100 p-4 border border-red-300">
              <div className="text-sm text-red-700 font-medium">{error || passwordError}</div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label htmlFor="password" className="block text-gray-700 font-semibold mb-1">Mật khẩu mới</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                placeholder="Nhập mật khẩu mới"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-700 font-semibold mb-1">Nhập lại mật khẩu mới</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError('');
                }}
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg shadow-lg hover:from-purple-600 hover:to-indigo-600 transition"
          >
            Đặt lại mật khẩu
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 