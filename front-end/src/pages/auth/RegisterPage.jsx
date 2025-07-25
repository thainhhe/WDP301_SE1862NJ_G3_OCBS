import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");

  const { register, error } = useAuth();
  const navigate = useNavigate(); // Thêm hook navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    setMessage('');

    // Cập nhật: Lấy kết quả trả về từ hàm register
    const success = await register({ name, email, password, province, city, gender, dob, phone });

    // Cập nhật: Điều hướng nếu đăng ký thành công
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white bg-opacity-95 rounded-3xl shadow-2xl p-10 space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Đăng ký tài khoản</h2>
          <p className="text-gray-500 mb-4">Tạo tài khoản để đặt vé, nhận ưu đãi và trải nghiệm phim tuyệt vời!</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {(error || message) && (
            <div className="rounded-md bg-red-100 p-4 border border-red-300">
              <div className="text-sm text-red-700 font-medium">{error || message}</div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">Họ và tên</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                placeholder="Nhập họ và tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-700 font-semibold mb-1">Mật khẩu</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-gray-700 font-semibold mb-1">Nhập lại mật khẩu</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="province" className="block text-gray-700 font-semibold mb-1">Tỉnh</label>
              <select
                id="province"
                name="province"
                required
                className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                value={province}
                onChange={e => setProvince(e.target.value)}
              >
                <option value="">Chọn tỉnh</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Cần Thơ">Cần Thơ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label htmlFor="city" className="block text-gray-700 font-semibold mb-1">Thành phố/Quận/Huyện</label>
              <input
                id="city"
                name="city"
                type="text"
                required
                className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                placeholder="Nhập thành phố/quận/huyện"
                value={city}
                onChange={e => setCity(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Giới tính</label>
              <div className="flex space-x-6 mt-1">
                <label className="inline-flex items-center cursor-pointer">
                  <input type="radio" name="gender" value="male" checked={gender === "male"} onChange={e => setGender(e.target.value)} className="form-radio text-indigo-500 focus:ring-indigo-400" />
                  <span className="ml-2 text-gray-700">Nam</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="radio" name="gender" value="female" checked={gender === "female"} onChange={e => setGender(e.target.value)} className="form-radio text-indigo-500 focus:ring-indigo-400" />
                  <span className="ml-2 text-gray-700">Nữ</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="radio" name="gender" value="other" checked={gender === "other"} onChange={e => setGender(e.target.value)} className="form-radio text-indigo-500 focus:ring-indigo-400" />
                  <span className="ml-2 text-gray-700">Khác</span>
                </label>
              </div>
            </div>
            <div>
              <label htmlFor="dob" className="block text-gray-700 font-semibold mb-1">Ngày sinh</label>
              <input
                id="dob"
                name="dob"
                type="date"
                required
                className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                value={dob}
                onChange={e => setDob(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-gray-700 font-semibold mb-1">Số điện thoại</label>
              <input
                id="phone"
                name="phone"
                type="text"
                required
                className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                placeholder="Nhập số điện thoại"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg shadow-lg hover:from-purple-600 hover:to-indigo-600 transition"
          >
            Đăng ký
          </button>
          <div className="text-center mt-4">
            <span className="text-sm text-gray-600">
              Đã có tài khoản?{' '}
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

export default RegisterPage;