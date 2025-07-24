import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';

const GENDER_OPTIONS = [
  { value: 'Nam', label: 'Nam' },
  { value: 'Nữ', label: 'Nữ' },
  { value: 'Khác', label: 'Khác' },
];
const PROVINCE_OPTIONS = [
  'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Khác'
];
const CITY_OPTIONS = [
  'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Khác'
];

const ProfilePage = () => {
  const { user, updateProfile, error } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    province: user?.province || '',
    city: user?.city || '',
    gender: user?.gender || '',
    dob: user?.dob ? user.dob.slice(0, 10) : '',
    genres: user?.preferences?.genres || [],
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [errorBookings, setErrorBookings] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchBookings = async () => {
      setLoadingBookings(true);
      setErrorBookings('');
      try {
        const res = await bookingService.getUserBookings();
        setBookings(res.bookings || []);
      } catch (err) {
        setErrorBookings('Không thể tải lịch sử đặt vé!');
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchBookings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenreChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      let genres = prev.genres || [];
      if (checked) {
        genres = [...genres, value];
      } else {
        genres = genres.filter((g) => g !== value);
      }
      return { ...prev, genres };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (isChangingPassword) {
      if (formData.newPassword !== formData.confirmNewPassword) {
        setMessage('New passwords do not match');
        return;
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
      if (!passwordRegex.test(formData.newPassword)) {
        setMessage(
          'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
        );
        return;
      }
    }

    const updateData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      province: formData.province,
      city: formData.city,
      gender: formData.gender,
      dob: formData.dob,
      preferences: { genres: formData.genres },
    };
    if (isChangingPassword) {
      updateData.currentPassword = formData.currentPassword;
      updateData.password = formData.newPassword;
    }
    const success = await updateProfile(updateData);
    if (success) {
      setMessage('Profile updated successfully');
      setIsEditing(false);
      setIsChangingPassword(false);
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      }));
    }
  };

  

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 flex gap-8">
      {/* Sidebar menu */}
      <div className="w-56 min-w-[180px]">
        <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col gap-2">
          <button
            className={`text-left px-4 py-2 rounded-lg font-medium transition ${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-50 text-indigo-700'}`}
            onClick={() => setActiveTab('profile')}
          >
            Thông tin cá nhân
          </button>
          <button
            className={`text-left px-4 py-2 rounded-lg font-medium transition ${activeTab === 'bookings' ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-50 text-indigo-700'}`}
            onClick={() => setActiveTab('bookings')}
          >
            Lịch sử đặt vé
          </button>
        </div>
      </div>
      {/* Main content */}
      <div className="flex-1">
        {activeTab === 'profile' && (
          <div className="bg-white shadow-lg rounded-2xl p-8 flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2 w-full space-y-6">
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">Thông tin cá nhân</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                {(error || message) && (
                  <div className={`rounded-md ${error ? 'bg-red-50' : 'bg-green-50'} p-4`}> 
                    <div className={`text-sm ${error ? 'text-red-700' : 'text-green-700'}`}>{error || message}</div>
                  </div>
                )}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Họ tên</label>
                  <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" name="email" id="email" value={formData.email} disabled className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 text-gray-500 sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                  <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label htmlFor="province" className="block text-sm font-medium text-gray-700">Tỉnh/Thành phố</label>
                    <select name="province" id="province" value={formData.province} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option value="">Chọn tỉnh/thành</option>
                      {PROVINCE_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="w-1/2">
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">Quận/Huyện</label>
                    <select name="city" id="city" value={formData.city} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option value="">Chọn quận/huyện</option>
                      {CITY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Giới tính</label>
                    <select name="gender" id="gender" value={formData.gender} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option value="">Chọn giới tính</option>
                      {GENDER_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </div>
                  <div className="w-1/2">
                    <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Ngày sinh</label>
                    <input type="date" name="dob" id="dob" value={formData.dob} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                </div>
               
                {isChangingPassword && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
                      <input type="password" name="currentPassword" id="currentPassword" value={formData.currentPassword} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                      <input type="password" name="newPassword" id="newPassword" value={formData.newPassword} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                      <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                      <input type="password" name="confirmNewPassword" id="confirmNewPassword" value={formData.confirmNewPassword} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-4">
                  {!isEditing && !isChangingPassword && (
                    <>
                      <button type="button" onClick={() => setIsEditing(true)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Chỉnh sửa</button>
                      <button type="button" onClick={() => setIsChangingPassword(true)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Đổi mật khẩu</button>
                    </>
                  )}
                  {(isEditing || isChangingPassword) && (
                    <>
                      <button type="button" onClick={() => {
                        setIsEditing(false);
                        setIsChangingPassword(false);
                        setFormData({
                          name: user?.name || '',
                          email: user?.email || '',
                          phone: user?.phone || '',
                          province: user?.province || '',
                          city: user?.city || '',
                          gender: user?.gender || '',
                          dob: user?.dob ? user.dob.slice(0, 10) : '',
                          genres: user?.preferences?.genres || [],
                          currentPassword: '',
                          newPassword: '',
                          confirmNewPassword: '',
                        });
                      }} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Huỷ</button>
                      <button type="submit" className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Lưu thay đổi</button>
                    </>
                  )}
                </div>
              </form>
            </div>
            <div className="md:w-1/2 w-full flex flex-col items-center justify-center bg-indigo-50 rounded-xl p-6">
              <div className="text-6xl mb-4">👤</div>
              <div className="text-lg font-semibold text-indigo-700 mb-2">{formData.name}</div>
              <div className="text-gray-500 mb-1">{formData.email}</div>
              <div className="mt-6 w-full">
                <div className="text-xs text-gray-400 mb-1">Sở thích thể loại phim</div>
                <div className="flex flex-wrap gap-2">
                  {formData.genres && formData.genres.length > 0 ? (
                    formData.genres.map((g) => (
                      <span key={g} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs border border-indigo-200">{g}</span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs">Chưa chọn</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'bookings' && (
          <div className="bg-white shadow-lg rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">Lịch sử đặt vé</h2>
            {loadingBookings ? (
              <div>Đang tải...</div>
            ) : errorBookings ? (
              <div className="text-red-600">{errorBookings}</div>
            ) : bookings.length === 0 ? (
              <div>Bạn chưa có lịch sử đặt vé nào.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-indigo-100">
                      <th className="px-3 py-2 text-left">Poster</th>
                      <th className="px-3 py-2 text-left">Phim</th>
                      <th className="px-3 py-2 text-left">Suất chiếu</th>
                      <th className="px-3 py-2 text-left">Ghế</th>
                      <th className="px-3 py-2 text-left">Trạng thái</th>
                      <th className="px-3 py-2 text-left">Ngày đặt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b._id} className="border-b">
                        <td className="px-3 py-2">
                          {b.showtime?.movie?.poster ? (
                            <img src={b.showtime.movie.poster.startsWith('http') ? b.showtime.movie.poster : `http://localhost:5000/${b.showtime.movie.poster.replace(/^\/+/, '')}`} alt="poster" className="w-14 h-20 object-cover rounded shadow" />
                          ) : (
                            <div className="w-14 h-20 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">No Image</div>
                          )}
                        </td>
                        <td className="px-3 py-2">{b.showtime?.movie?.title || ''}</td>
                        <td className="px-3 py-2">{b.showtime?.startTime ? new Date(b.showtime.startTime).toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }) : ''}</td>
                        <td className="px-3 py-2">{b.seats?.map(s => s.row + s.number).join(', ')}</td>
                        <td className="px-3 py-2">{b.checkedIn ? 'Đã check-in' : 'Chưa check-in'}</td>
                        <td className="px-3 py-2">{b.createdAt ? new Date(b.createdAt).toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }) : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 