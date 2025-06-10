import { AuthProvider } from "./context/AuthContext";
import PropTypes from "prop-types";

function App({ children }) {
    return <AuthProvider>{children}</AuthProvider>;
}

App.propTypes = {
    children: PropTypes.node.isRequired,
};

export default App;