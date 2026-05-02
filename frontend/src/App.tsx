import Register from "./pages/Register"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard";
import Navbar from "./pages/Navbar";
import Explore from "./pages/Explore";
import ProtectedRoutes from "./components/ProtectedRoute";
import ProjectDetails from "./pages/ProjectDetails";
import { Toaster } from "react-hot-toast";
import { PublicRoute } from "./components/PublicRoute";

function App() {
  return (
    <Router>
      <Toaster position="bottom-right" reverseOrder={false} />
      <Navbar/>
        <Routes>
          <Route element={<PublicRoute />} >
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Route>
          

          <Route element={<ProtectedRoutes />} >
            <Route path="/profiles/:userId" element={<Dashboard />} />
            <Route path="/projects" element={<Explore />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
          </Route>
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
    </Router>
  );
}




export default App