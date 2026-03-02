// src/pages/auth/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const result = login(email, password);

    if (!result.success) {
      setError("Invalid email or password");
      return;
    }

    // Role-based redirect
    switch (result.role) {
      case 'Admin':
        navigate("/stores");
        break;
      case 'Manager':
        navigate("/users");
        break;
      case 'Cashier':
        navigate("/pos");
        break;
      default:
        navigate("/pos");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <div className="text-center mb-4">
        <h2>🏢 Sublime Tech POS</h2>
        <p className="text-muted">Point of Sale System</p>
      </div>

      <div className="card shadow">
        <div className="card-body">
          <h4 className="mb-3 text-center">Login</h4>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input 
                className="form-control" 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your email"
                required 
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input 
                className="form-control" 
                type="password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter your password"
                required 
              />
            </div>

            <button className="btn btn-primary w-100 mb-3">
              🔐 Login
            </button>
          </form>
        </div>
      </div>

      {/* Demo Credentials */}
      <div className="card mt-3">
        <div className="card-body">
          <small className="text-muted d-block mb-2"><strong>Demo Credentials:</strong></small>
          <small className="text-muted d-block">
            👑 Admin: admin@sublimetech.com / admin123
          </small>
          <small className="text-muted d-block">
            Create Manager via Admin Panel and Cashier via Manager Panel. 
          </small>
        </div>
      </div>
    </div>
  );
}