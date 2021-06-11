import LockScreen from "./Components/LockScreen/LockScreen";
import "./App.css";
import { Route, Switch } from "react-router";
import HomeScreen from "./Components/HomeScreen/HomeScreen";
import { useEffect, useState } from "react";
import parseJwt from "./Utils/helpers";

function App() {
  const [checkUser, setCheckUser] = useState(false);

  const token = localStorage.getItem("NemesisToken");

  useEffect(() => {
    if (token) {
      var Tokenexp = new Date(0);
      Tokenexp.setUTCSeconds(parseJwt(token).exp);
      if (Date.now() < +Tokenexp) {
        setCheckUser(true);
      }
    }
  }, [token]);

  return (
    <div className="App">
      <Switch>
        {!checkUser && <Route path="/" component={LockScreen} />}
        {checkUser && <Route exact path="/" component={HomeScreen} />}
      </Switch>
    </div>
  );
}

export default App;
