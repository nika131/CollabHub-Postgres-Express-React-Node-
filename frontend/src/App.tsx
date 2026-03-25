import Register from "./pages/Register"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard";
import Navbar from "./pages/Navbar";

function App() {
  return (
    <Router>
      <Navbar/>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={"<div>Exploer page is comin soon</div>"} />
        </Routes>
    </Router>
  );
}


export default App