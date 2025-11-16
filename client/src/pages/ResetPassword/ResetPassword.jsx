import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { assets } from "../.././assets/assets";
import { useNavigate } from "react-router-dom";

import "./index.css";

const state = {
  email: "email",
  otp: "otp",
  password: "password",
};

const ResetPassword = () => {
  const { backendUrl } = useContext(AppContext);
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [status, setStatus] = useState(state.email);
  const [otp, setOtp] = useState(0);

  /*For ---->   Form 1*/
  const submitForm1 = async (event) => {
    event.preventDefault();
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-reset-otp",
        { email }
      );
      data.success ? toast.success(data.message) : toast.error(data.message);
      data.success && setStatus(state.otp);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboradData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };
  const inputRefs = React.useRef([]);
  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  /*For ---->   Form 2*/

  const submitForm2 = async (event) => {
    try {
      event.preventDefault();
      const otpArray = inputRefs.current.map((e) => e.value);
      const otp = otpArray.join("");
      setOtp(otp);
      setStatus(state.password);
    } catch (e) {
      toast.error(e.message);
    }
  };

  /*For ---->   Form 3*/

  const submitForm3 = async (event) => {
    event.preventDefault();
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/reset-password",
        { email, otp, newPassword }
      );
      data.success ? toast.success(data.message) : toast.error(data.message);
      data.success && navigate("/login");
    } catch (e) {
      toast.error(e.message);
    }
  };
  return (
    <div className="reset-container">
      {status === state.email && (
        <form className="form-1" onSubmit={submitForm1}>
          <h1>Reset your Password</h1>
          <p>Enter your registered email address</p>
          <div className="input-div">
            <label htmlFor="email">
              <img src={assets.mail_icon} alt="email" />
            </label>
            <input
              type="email"
              placeholder="Enter email address"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit">Reset Password</button>
        </form>
      )}
      {status === state.otp && (
        <form className="verify-box" onSubmit={submitForm2}>
          <h1>Reset Password OTP</h1>
          <p>Enter Your 6-digit OTP sent to your Email id.</p>
          <div className="otp" onPaste={handlePaste}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  type="text"
                  maxLength="1"
                  key={index}
                  className="input"
                  onInput={(e) => handleInput(e, index)}
                  ref={(e) => (inputRefs.current[index] = e)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              ))}
          </div>
          <button type="submit">Reset Password</button>
        </form>
      )}
      {status === state.password && (
        <form className="form-1" onSubmit={submitForm3}>
          <h1>Set Password</h1>
          <p>Enter your new password</p>
          <div className="input-div">
            <label htmlFor="email">
              <img src={assets.lock_icon} alt="password" />
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              id="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <button type="submit">Submit</button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
