import "./index.css";
import { assets } from "../../assets/assets";
import { data, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../Loader/Loader";


const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const[loader,setLoader]=useState(false)
 
  const { userData, backendUrl, setUserData, setIsLoggedin } =
    useContext(AppContext);

  const logout = async () => {
    try {
      setLoader(true)
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/logout",{},{ withCredentials: true });
      data.success && setIsLoggedin(false);
      data.success && setUserData(false);
      data.success&&setLoader(false);
      navigate("/");
    } catch (e) {
      toast.error(e.message);
      setLoader(false)
    }
  };
  const sendVerificationOtp = async () => {
    
    try {
      setLoader(true)
      axios.defaults.withCredentials = true;
    
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-verify-otp",{},{ withCredentials: true }
      );
      
      if (data.success) {
        setLoader(false)
        navigate("/email-verify");
        toast.success(data.message);

      } else {
        setLoader(false)
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e);
    }
  };

  return (
    <nav>
      <img src={assets.logo} alt="" onClick={() => navigate("/")} />
      {userData ? (
        <div className="user-logo">
          {location.pathname !== "/login" &&
            location.pathname !== "/reset-password" &&
            location.pathname !== "/email-verify" && (
              <p className="userName">{userData.name[0].toUpperCase()}</p>
            )}

          <ul className="options">
            {!userData.isAccountVerified && (
              <li onClick={sendVerificationOtp}>Verify Email</li>
            )}
            <li onClick={logout}>Logout</li>
          </ul>
        </div>
      ) :loader?<Loader/>: (
        location.pathname !== "/login" &&
        location.pathname !== "/reset-password" &&
        location.pathname !== "/email-verify" && (
          <button type="button" onClick={() => navigate("/login")}>
            Login <img src={assets.arrow_icon} alt="" />
          </button>
        )
      )}
    </nav>
  );
};

export default NavBar;
