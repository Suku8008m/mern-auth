import "./index.css";
import { assets } from "../../assets/assets";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
 
  const { userData, backendUrl, setUserData, setIsLoggedin } =
    useContext(AppContext);

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/logout",{},{ withCredentials: true });
      data.success && setIsLoggedin(false);
      data.success && setUserData(false);
      navigate("/");
    } catch (e) {
      toast.error(e.message);
    }
  };
  const sendVerificationOtp = async () => {
    
    try {
      axios.defaults.withCredentials = true;
      console.log("Before");
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-verify-otp",{},{ withCredentials: true }
      );
      console.log(data)
      
      if (data.success) {
        navigate("/email-verify");
        toast.success(data.message);
      } else {
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
      ) : (
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
