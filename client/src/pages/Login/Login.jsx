import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { assets } from "../.././assets/assets";
import "./index.css";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();

  const { backendUrl, isLoggedin, userData, setIsLoggedin, getUserData } =
    useContext(AppContext);

  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onChangeForm = () => {
    if (state === "Sign Up") {
      setState("Login");
      setName("");
      setPassword("");
      setEmail("");
    } else {
      setState("Sign Up");
      setName("");
      setPassword("");
      setEmail("");
    }
  };

  const submitForm = async (event) => {
    try {
      event.preventDefault();
      axios.defaults.withCredentials = true;
      if (state === "Sign Up") {
        const { data } = await axios.post(backendUrl + "/api/auth/register", {
          email,
          name,
          password,
        });
        if (data.success) {
          setIsLoggedin(true);
          getUserData();
          navigate("/");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/auth/login", {
          email,
          password,
        });
        if (data.success) {
          setIsLoggedin(true);
          getUserData();
          navigate("/");
        } else {
          toast.error(data.message);
        }
      }
    } catch (e) {
      toast.error(e.message);
    }
  };
  useEffect(() => {
    isLoggedin && userData && navigate("/");
  }, [isLoggedin, userData]);

  return (
    <section id="login">
      <form className="card" onSubmit={submitForm}>
        {state === "Sign Up" ? (
          <h1>Create Account</h1>
        ) : (
          <h1>Login Acccount</h1>
        )}
        {state === "Sign Up" ? (
          <p>Create your account</p>
        ) : (
          <p>Login to your account</p>
        )}
        {state === "Sign Up" && (
          <div className="input-field">
            <img src={assets.person_icon} alt="" />
            <input
              type="text"
              onChange={(event) => setName(event.target.value)}
              placeholder="Full Name"
              required
              value={name}
            />
          </div>
        )}
        <div className="input-field">
          <img src={assets.mail_icon} alt="" />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email id"
            required
          />
        </div>
        <div className="input-field">
          <img src={assets.lock_icon} alt="" />
          <input
            type="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="password"
            required
            value={password}
          />
        </div>
        {state !== "Sign Up" && (
          <span className="link">
            <p className="forgot" onClick={() => navigate("/reset-password")}>
              Forgot password?
            </p>
          </span>
        )}
        <button type="submit">
          {state === "Sign Up" ? "Sign Up" : "Login"}
        </button>
        {state === "Sign Up" ? (
          <div className="bottom">
            <p className="para-bottom">Already have an account?</p>
            <span className="link">
              <button type="button" onClick={onChangeForm}>
                Login here
              </button>
            </span>
          </div>
        ) : (
          <div className="bottom">
            <p className="para-bottom">Don't have an account?</p>
            <span className="link">
              <button type="button" onClick={onChangeForm}>
                Signup here
              </button>
            </span>
          </div>
        )}
      </form>
    </section>
  );
};

export default Login;
