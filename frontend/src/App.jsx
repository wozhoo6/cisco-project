import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";


import LoginPage from "./pages/LoginPage";


const user = false;
const App = () => {
  return (
    <BrowserRouter>
      <Routes>

          <Route path="/" element={<Home />} />
     <Route path="/login" element={user ? <Navigate to='/' /> : <LoginPage />} />

    
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
};

export default App;