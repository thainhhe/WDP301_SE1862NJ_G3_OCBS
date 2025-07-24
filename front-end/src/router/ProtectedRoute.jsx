import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@context/AuthContext.jsx";
import LoadingSpinner from "@components/ui/LoadingSpinner.jsx";
import PropTypes from "prop-types";

/**
 * Component bảo vệ route dựa trên trạng thái đăng nhập và vai trò người dùng.
 * @param {object} props
 * @param {React.ReactNode} props.children - Component con cần được bảo vệ.
 * @param {string[]} [props.allowedRoles] - Mảng các vai trò được phép truy cập. Nếu không cung cấp, chỉ cần đăng nhập.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        // Hiển thị loading spinner trong khi chờ xác thực
        return <LoadingSpinner />;
    }

    if (!user) {
        // Nếu người dùng chưa đăng nhập, chuyển hướng đến trang login
        // và lưu lại trang hiện tại để có thể quay lại sau khi đăng nhập thành công
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Nếu người dùng đã đăng nhập nhưng không có quyền truy cập
        // chuyển hướng về trang chủ hoặc trang "Không có quyền truy cập"
        // Ở đây, chúng ta chuyển hướng về trang chủ
        return <Navigate to="/" replace />;
    }

    // Nếu mọi thứ đều hợp lệ, hiển thị component con
    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;