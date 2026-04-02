import Register from "./pages/Register"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard";
import Navbar from "./pages/Navbar";
import Explore from "./pages/Explore";
import ProtectedRoutes from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Navbar/>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoutes />} >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Explore />} />
          </Route>
          
          <Route path="/*" element={<Navigate to="/login" />} />
        </Routes>
    </Router>
  );
}


export default App