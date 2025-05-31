import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "@components/layout/Layout";

import LoadingSpinner from "@components/ui/LoadingSpinner";

// Lazy loaded pages
const Home = lazy(() => import("@pages/Home"));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public Routes */}
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
