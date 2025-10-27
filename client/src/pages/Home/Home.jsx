import { useContext } from "react";
import { assets } from "../.././assets/assets";
import "./index.css";
import { AppContext } from "../../context/AppContext";

const Home = () => {
  const { userData } = useContext(AppContext);
  return (
    <header>
      <img src={assets.header_img} />
      <div className="hello">
        <h2>
          Hey{" "}
          <span className="userName">
            {userData ? userData.name : "Developer"}
          </span>
          !
        </h2>
        <img src={assets.hand_wave} alt="" />
      </div>
      <h1>Welcome to our app</h1>
      <p>
        Let's start with a quick tour and we will have you up and running in no
        time!
      </p>
      <button type="button">Get Started</button>
    </header>
  );
};

export default Home;
