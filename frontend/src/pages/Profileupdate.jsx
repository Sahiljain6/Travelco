import React from "react";
import { Navigate } from "react-router-dom";

// Profile editing now lives on the authenticated dashboard. Keep this legacy URL working.
const Profileupdate = () => <Navigate to="/profile" replace />;
export default Profileupdate;
