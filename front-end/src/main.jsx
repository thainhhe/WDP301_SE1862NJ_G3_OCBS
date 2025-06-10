import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import App from "./App";
import router from "@router"; // Import router từ file cấu hình mới
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App>
            <RouterProvider router={router} />
            <ToastContainer position="top-right" autoClose={3000} />
        </App>
    </React.StrictMode>
);