import { useEffect, useState, Fragment } from "react";
import "./HomeScreen.scss";
import parseJwt from "../../Utils/helpers";
import axios from "axios";
import { Button } from "@material-ui/core";
import Snackbar from "@material-ui/core/Snackbar";
import Slide from "@material-ui/core/Slide";
import Alert from "@material-ui/lab/Alert";

const HomeScreen = () => {
  const [user, setUser] = useState(null);
  const [showTabOne, setShowTabOne] = useState(true);
  const [formData, setFormData] = useState(null);
  const [showError, setShowError] = useState({
    status: false,
    msg: "",
  });
  const [showSuccess, setShowSuccess] = useState({
    status: false,
    msg: "You are good to go",
  });
  var formfilled = true;

  // Form Inputs
  const [usernameInput, setUsernameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [addressInput, setAddressInput] = useState("");

  const token = localStorage.getItem("NemesisToken");
  useEffect(() => {
    if (token) {
      setUser(parseJwt(token));
    }
  }, [token]);

  async function submitForm() {
    const data = {
      username: usernameInput,
      phone: phoneInput,
      email: emailInput,
      address: addressInput,
    };

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    await axios
      .post("http://localhost:5000/api/details/fill", data, config)
      .then((res) => {
        if (res.status === 200) {
          setShowSuccess((prevShowSuccess) => {
            return { ...prevShowSuccess, status: true };
          });
          formfilled = true;
          tab2Fill();
          setUsernameInput("");
          setPhoneInput("");
          setEmailInput("");
          setAddressInput("");
        }
      })
      .catch((err) => {
        let errorMesg = err?.response?.data?.errors[0]?.msg;
        setShowError({ status: true, msg: errorMesg });
      });
  }

  function logOut() {
    localStorage.removeItem("NemesisToken");
    window.location.reload();
  }

  const tab2Fill = () => {
    if (formfilled) {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      axios
        .get("http://localhost:5000/api/details/fill", config)
        .then((res) => {
          if (res.status === 200) {
            setFormData({
              username: res.data.username,
              phone: res.data.phone,
              email: res.data.email,
              address: res.data.address,
              _id: res.data._id,
            });
          }
        })
        .catch((err) => {
          let errorMesg = err?.response?.data?.errors[0]?.msg;
          setShowError({ status: true, msg: errorMesg });
        });
    }
  };

  const deleteData = async (objKeyName) => {
    const data = {
      id: formData._id,
      field: objKeyName,
    };

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    await axios
      .patch("http://localhost:5000/api/details/fill", data, config)
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  };

  function TransitionUp(props) {
    return <Slide {...props} direction="up" />;
  }

  return (
    <div className="HomeScreen_Container">
      <div className="box"></div>
      <Button onClick={() => logOut()} className="btn_logout">
        Logout
      </Button>
      {showTabOne ? (
        <Fragment>
          <div className="tabs_Container">
            <Button
              onClick={() => {
                setShowTabOne(false);
              }}
            >
              Go to Tab Two
            </Button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitForm();
            }}
            className="input_Container"
          >
            <h4>Let's assume this is a Contact Form</h4>
            <input
              key="1"
              value={usernameInput}
              required
              onChange={(e) => {
                setUsernameInput(e.target.value);
              }}
              placeholder="Username"
              type="text"
            />
            <input
              key="2"
              value={phoneInput}
              required
              onChange={(e) => {
                setPhoneInput(e.target.value);
              }}
              placeholder="Mobile Number"
              type="tel"
            />
            <input
              key="3"
              value={emailInput}
              required
              onChange={(e) => {
                setEmailInput(e.target.value);
              }}
              placeholder="Email"
              type="email"
            />
            <textarea
              key="4"
              value={addressInput}
              required
              onChange={(e) => {
                setAddressInput(e.target.value);
              }}
              placeholder="Address"
              rows="3"
            />
            <Button
              variant="outlined"
              color="primary"
              type="submit"
              className="formSibmitBtn"
            >
              Submit
            </Button>
          </form>
          <div className="desc_Container">
            {user && <h3>Welcome, {user.email}</h3>}
            <h1>Just Chill and fill in</h1>
            <h2>Afterwards, go check the other tab</h2>
          </div>
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
            autoHideDuration={2000}
            TransitionComponent={TransitionUp}
            key={showSuccess.msg}
          >
            <Alert severity="success">{showSuccess.msg}!</Alert>
          </Snackbar>
        </Fragment>
      ) : (
        <Fragment>
          <div className="tabs_Container">
            <Button
              onClick={() => {
                setShowTabOne(true);
              }}
            >
              Go to Tab One
            </Button>
          </div>
          {showTabOne === false && formfilled && formData !== null ? (
            <div className="tab2_Container_main">
              Fetched Latest
              {Object.keys(formData).map((objKeys) => {
                if (objKeys !== "_id") {
                  return (
                    <div
                      key={objKeys}
                      id={objKeys}
                      className="tab2_Container_main_rows"
                    >
                      <h4>
                        {objKeys} : {formData[objKeys]}
                      </h4>
                      <button
                        onClick={(e) => {
                          deleteData(objKeys);
                          var parentEl = document.getElementById(
                            e.target.parentElement.id
                          );
                          parentEl.firstChild.innerText = `${objKeys} : `;
                        }}
                        variant="outlined"
                        color="secondary"
                      >
                        Delete
                      </button>
                    </div>
                  );
                }
              })}
            </div>
          ) : (
            <div className="tab2_Container">
              <h1>
                Don't miss the step,
                <br />
                First fill the info then visit here
              </h1>
            </div>
          )}
        </Fragment>
      )}
    </div>
  );
};

export default HomeScreen;
