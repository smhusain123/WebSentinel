import { useState } from "react";

function Login({ onLogin, onRegister })  {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);

      onLogin();

    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>WebSentinel</h1>
        <p>Login to your account</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="login-error">{error}</p>
          )}

          <button type="submit">
            Login
          </button>
        </form>
            <p>
  Don't have an account?{" "}
  <button
    type="button"
    onClick={onRegister}
    className="link-button"
  >
    Register
  </button>
</p>
      </div>
    </div>
  );
}

export default Login;