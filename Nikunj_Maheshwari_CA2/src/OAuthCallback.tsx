import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      if (error) {
        console.error("OAuth callback error:", error.message);
      } else {
        console.log("Session:", data.session);
        navigate("/");
      }
    };
    handleAuth();
  }, [navigate]);

  return <div>Authenticating...</div>;
};

export default OAuthCallback;
