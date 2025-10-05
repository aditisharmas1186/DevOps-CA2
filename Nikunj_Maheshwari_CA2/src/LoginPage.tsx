import React from "react";
import { supabase } from "./lib/supabaseClient";

const LoginPage: React.FC = () => {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: window.location.origin + "/interests",
      },
    });

    if (error) {
      console.error("Login error:", error.message);
      alert("Login failed. Check console for details.");
    }
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
      <div className="text-center">
        <h1 className="mb-4">Welcome to Pitch-Haven</h1>
        <p className="mb-4">Please login with GitHub to continue.</p>
        <button className="btn btn-dark btn-lg" onClick={handleLogin}>
          <i className="bi bi-github me-2"></i> Login with GitHub
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
