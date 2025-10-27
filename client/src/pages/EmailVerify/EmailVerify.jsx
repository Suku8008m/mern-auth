import React, { useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import "./index.css";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
const EmailVerify = () => {
  axios.defaults.withCredentials = true;
  const { backendUrl, isLoggedin, userData, getUserData } =
    useContext(AppContext);
  const navigate = useNavigate();

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
  const handlePaste = (e) => {
    const paste = e.clipboradData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitHandler = async (event) => {
    try {
      event.preventDefault();
      const otpArray = inputRefs.current.map((e) => e.value);
      const otp = otpArray.join("");
      console.log(otp);
      const { data } = await axios.post(
        backendUrl + "/api/auth/verify-account",
        { otp }
      );
      if (data.success) {
        toast.success(data.message);
        getUserData();
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.message);
    }
  };
  useEffect(() => {
    isLoggedin && userData && userData.isAccountVerified && navigate("/");
  }, [isLoggedin, userData]);

  return (
    <div className="EmailVerify">
      <form onSubmit={onSubmitHandler} className="verify-box">
        <h1>Verify Email</h1>
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
        <button type="submit">Verify Email</button>
      </form>
    </div>
  );
};

export default EmailVerify;
