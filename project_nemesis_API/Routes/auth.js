const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const UserSchema = require("../Schema/user.model");

const SECRET = process.env.SECRET;

router.post(
  "/register",
  [
    body("email", "Invalid Email")
      .isEmail()
      .normalizeEmail()
      .custom((value) => {
        return UserSchema.find({
          email: value,
        }).then((user) => {
          if (user && user.length === 1) {
            return Promise.reject("E-mail already in use");
          }
        });
      }),

    body("password")
      .isLength({
        min: 8,
      })
      .withMessage("must be at least 8 chars long")
      .matches(/[a-zA-Z]/)
      .withMessage("must contain alphabets")
      //   .matches(/[A-Z]/)
      //   .withMessage("must contain one Uppercase Alphabets")
      .matches(/\d/)
      .withMessage("must contain a number"),
    //   .matches(/[!@#$%^&*()\\]/)
    //   .withMessage("must contain a special character"),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    } else {
      let newUser = new UserSchema(req.body);

      bcrypt.genSalt(10, async (saltErr, salt) => {
        if (saltErr) throw saltErr;

        bcrypt.hash(newUser.password, salt, async (HashErr, hash) => {
          if (HashErr) throw HashErr;

          newUser.password = hash;

          newUser.save((docErr, doc) => {
            if (docErr) throw docErr;

            const PAYLOAD = {
              email: newUser.email,
              username: doc.username,
            };

            jwt.sign(
              PAYLOAD,
              SECRET,
              {
                expiresIn: "5m",
              },
              (jwtErr, token) => {
                if (jwtErr) throw jwtErr;
                else
                  res.json({
                    token,
                  });
              }
            );
          });
        });
      });
    }
  }
);

router.post(
  "/login",
  [
    body("email", "Invalid Email").isEmail().normalizeEmail(),
    body("password")
      .isLength({
        min: 8,
      })
      .withMessage("Incorrect Password")
      .matches(/[a-zA-Z]/)
      .withMessage("Incorrect Password")
      //   .matches(/[A-Z]/)
      //   .withMessage("Incorrect Password")
      .matches(/\d/)
      .withMessage("Incorrect Password"),
    //   .matches(/[!@#$%^&*()\\]/)
    //   .withMessage("Incorrect Password"),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    } else {
      const email = req.body.email;
      UserSchema.findOne(
        {
          email: email,
        },
        (UserSchemaErr, doc) => {
          if (UserSchemaErr) throw UserSchemaErr;

          if (doc === null)
            return res.json({
              message: "User Not Found",
            });
          bcrypt.compare(
            req.body.password,
            doc.password,
            (bcryptErr, isMatch) => {
              if (bcryptErr) throw bcryptErr;

              if (isMatch === true) {
                const PAYLOAD = {
                  email: doc.email,
                  username: doc.username,
                };
                jwt.sign(
                  PAYLOAD,
                  SECRET,
                  {
                    expiresIn: "5m",
                  },
                  (err, token) => {
                    if (err) throw err;
                    else
                      return res.json({
                        token,
                      });
                  }
                );
              } else {
                res.json({
                  message: "Incorrect Credentials",
                });
              }
            }
          );
        }
      );
    }
  }
);

module.exports = router;
