import React, { useState } from "react";
import "./Login.css";

import EyeIcon from "./src assets/eye icon.png";
 
 
import { useAuth } from "./utilis/AuthContext"; // Import useAuth hook from AuthContext
import axios from "axios";

const Login = ({ onLoginClick, handleSignUpClick }) => {
  const [loginType, setLoginType] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  

  const { login } = useAuth(); // Destructure login function from useAuth hook
 

 

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
    setUsernameError("");
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    setPasswordError("");
  };

 
  const handleLoginType = (type) => {
    setLoginType(type);
    setUsername("");
    setPassword("");
    setUsernameError("");
    setPasswordError("");
    setShowPassword(false);
  };

  const handleSubmit = async () => {
    if (username.trim() === "") {
      setUsernameError("Username is required");
    }
    if (password.trim() === "") {
      setPasswordError("Password is required");
    }

    if (username.trim() !== "" && password.trim() !== "") {
      let response;

      try {
        if (loginType === "admin") {
          response = await axios.post(
            "https://employeemanagement-backend-uubq.onrender.com/api/login_admin",
            { email: username, password },
            { withCredentials: true }
          );
        } else if (loginType === "employee") {
          response = await axios.post(
            "https://employeemanagement-backend-uubq.onrender.com/api/login_employee",
            { email: username, password },
            { withCredentials: true }
          );
        }

        // Assuming the response contains user data upon successful login
        const userData = response.data;

        // Call the login function from useAuth hook to set the user in context
        login(userData);

        // Navigate to home page after successful login

        // Call onLoginClick if necessary
        onLoginClick(loginType);
      } catch (error) {
        // Handle error response
        if (error.response && error.response.status === 401) {
          // Unauthorized - invalid credentials
          alert("Invalid username or password. Please try again.");
        } else {
          // Other error (e.g., network error)
          alert("Invalid username or password. Please try again.");
        }
      }
    }
  };

  const renderWelcomeMessage = () => {
    switch (loginType) {
      case "admin":
        return <p>Welcome Admin</p>;
      case "employee":
        return <p>Welcome Employee</p>;

      default:
        return null;
    }
  };

  return (
    <div className="login-container">
      <div className="right-side">
        <div className="welcome-text">
          <p>Welcome to HRM</p>
          <hr className="horizontal-line" />
        </div>
        <div className="buttons-container">
          <button
            className="admin-button"
            onClick={() => handleLoginType("admin")}
          >
            Admin
          </button>
          <button
            className="employee-button"
            onClick={() => handleLoginType("employee")}
          >
            Employee
          </button>
        </div>
        <div className="sign-in-text">
          <p>Sign in</p>
        </div>

        {renderWelcomeMessage()}
        <div className="input-container username-container">
          <input
            type="text"
            placeholder=" "
            className={`username-input ${usernameError && "input-error"}`}
            value={username}
            onChange={handleUsernameChange}
          />
          <label
            className={`label ${username && !usernameError && "has-content"}`}
          >
            Email*
          </label>
          {usernameError && <p className="error-message">{usernameError}</p>}
        </div>
        <div className="input-container password-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder=" "
            className={`password-input ${passwordError && "input-error"}`}
            value={password}
            onChange={handlePasswordChange}
          />
          <label
            className={`label ${password && !passwordError && "has-content"}`}
          >
            Password*
          </label>
          <img
            src={EyeIcon}
            alt="Show/Hide Password"
            className="eye-icon"
            onMouseDown={() => setShowPassword(true)}
            onMouseUp={() => setShowPassword(false)}
          />
          {passwordError && <p className="error-message">{passwordError}</p>}
        </div>

        <button className="login-button" onClick={handleSubmit}>
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
