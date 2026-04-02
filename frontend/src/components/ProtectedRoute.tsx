import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoutes(){
    const token = localStorage.getItem("token");
    const location = useLocation();

    if(!token){
        return <Navigate to="/login" state={{from: location, message: "Please login to access this page."}} replace/>;
    }

    return <Outlet />;
}