import { useState } from "react";

function Register({ onRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      setSuccess("Registration successful! You can now login.");

      setName("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        onRegister();
      }, 1000);

    } catch (error) {
      setError("Unable to connect to server");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>WebSentinel</h1>
        <p>Create your account</p>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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

          {success && (
            <p className="login-success">{success}</p>
          )}

          <button type="submit">
            Register
          </button>
        </form>

        <p>
          Already have an account?{" "}
          <button
            type="button"
            onClick={onRegister}
            className="link-button"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;