import { useEffect, useState } from "react";
import axios from "axios";
import "./LockScreen.scss";
import { Button } from "@material-ui/core";
import Snackbar from "@material-ui/core/Snackbar";
import Slide from "@material-ui/core/Slide";
import Alert from "@material-ui/lab/Alert";
import demoImg from "../../Media/demo.jpg";
import AvatarImg from "../../Media/Avatar.jpg";

const LockScreen = () => {
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showError, setShowError] = useState({
    status: false,
    msg: "",
  });
  const [showSuccess, setShowSuccess] = useState({
    status: false,
    msg: "You are good to go",
  });
  const [batteryObject, setBatteryObject] = useState(null);

  const login = async () => {
    const data = {
      email: emailInput,
      password: passwordInput,
    };

    await axios
      .post("http://localhost:5000/api/auth/login", data)
      .then((res) => {
        if (res.status === 200) {
          setShowSuccess((prevShowSuccess) => {
            return { ...prevShowSuccess, status: true };
          });
          setEmailInput("");
          setPasswordInput("");
          localStorage.setItem("NemesisToken", res.data.token);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      })
      .catch((err) => {
        let errorMesg = err.response.data.errors[0].msg;
        setShowError({ status: true, msg: errorMesg });
      });
  };

  useEffect(() => {
    const timeh1 = document.getElementById("time");

    setInterval(() => {
      timeh1.innerHTML = showTime();
    }, 1000);

    // If the device is mobile, tablet or laptop

    let isBatterySupported = "getBattery" in navigator;
    if (isBatterySupported) {
      let batteryPromise = navigator.getBattery();
      batteryPromise
        .then((batteryDetails) => {
          setBatteryObject(batteryDetails);
          batteryDetails.addEventListener("levelchange", (e) => {
            setBatteryObject(e.target);
          });
          return batteryDetails.addEventListener("levelchange", (e) => {
            setBatteryObject(e.target);
          });
        })
        .catch((err) => console.log(err));
    }
  }, []);

  function showTime() {
    const currentTimeClient = new Date();
    var tempHour = currentTimeClient.getHours(),
      tempMins = currentTimeClient.getMinutes(),
      tempTimeString = "";
    if (tempHour < 10) {
      if (tempMins < 10) {
        tempTimeString = `0${tempHour} : 0${tempMins}`;
      } else {
        tempTimeString = `0${tempHour} : ${tempMins}`;
      }
    } else {
      if (tempMins < 10) {
        tempTimeString = `${tempHour} : 0${tempMins}`;
      } else {
        tempTimeString = `${tempHour} : ${tempMins}`;
      }
    }
    return tempTimeString;
  }

  function TransitionUp(props) {
    return <Slide {...props} direction="up" />;
  }

  return (
    <div className="lockScreen_Container">
      <div className="box"></div>
      <img src={demoImg} alt="" />
      <div className="entryLoginContainer">
        <div className="imgContainer">
          <img src={AvatarImg} alt="" />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            login();
          }}
          className="inputContainer"
        >
          <input
            required
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            type="email"
            placeholder="Email"
          />
          <input
            required
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            type="password"
            placeholder="*********"
          />
          <Button type="submit">Login</Button>
        </form>
      </div>
      <div className="dateTime_Container">
        <h1 id="time"> </h1>
        <h2>{new Date().toDateString()}</h2>
      </div>
      {batteryObject !== null && (
        <div className="batteryStatus_Container">
          <h3>Battery Status : {batteryObject.level * 100}%</h3>
        </div>
      )}
      <Snackbar
        open={showError.status}
        onClose={() => {
          setShowError({
            status: false,
            msg: "",
          });
        }}
        autoHideDuration={5000}
        TransitionComponent={TransitionUp}
        key={showError.msg}
      >
        <Alert severity="error">{showError.msg}!</Alert>
      </Snackbar>
      <Snackbar
        open={showSuccess.status}
        onClose={() => {
          setShowSuccess((prevShowSuccess) => {
            return { ...prevShowSuccess, status: false };
          });
        }}
        autoHideDuration={5000}
        TransitionComponent={TransitionUp}
        key={showSuccess.msg}
      >
        <Alert severity="success">{showSuccess.msg}!</Alert>
      </Snackbar>
    </div>
  );
};

export default LockScreen;
