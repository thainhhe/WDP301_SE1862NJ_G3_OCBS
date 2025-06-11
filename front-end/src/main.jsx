// front-end/src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "@router";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme'; // Import theme bạn đã tạo

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <AuthProvider>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <RouterProvider router={router} />
                <ToastContainer position="top-right" autoClose={3000} />
            </ThemeProvider>
        </AuthProvider>
    </React.StrictMode>
);