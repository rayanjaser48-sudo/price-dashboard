import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./Component/ProtectedRoute";
import Display from "./pages/Display";
import "./App.css"
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import { supabase } from "./services/supabase";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (loading) return null;

  return (
    <>
      <Toaster position="top-center" />

      <BrowserRouter>
        <Routes>

          {/* صفحة تسجيل الدخول */}
          <Route
            path="/login"
            element={
              session ? <Navigate to="/display" /> : <Login />
            }
          />

          {/* لوحة التحكم */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* شاشة العرض */}
          <Route path="/display" element={<Display />} />

          {/* أي مسار آخر */}
          <Route
            path="*"
            element={
              session ? <Navigate to="/display" /> : <Navigate to="/login" />
            }
          />

        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
