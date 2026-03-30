import Register from "./pages/Register"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard";
import Navbar from "./pages/Navbar";
import Explore from "./pages/Explore";

function App() {
  return (
    <Router>
      <Navbar/>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Explore />} />
        </Routes>
    </Router>
  );
}


export default App