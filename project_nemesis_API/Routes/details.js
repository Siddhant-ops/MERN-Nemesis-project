const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const FormSchema = require("../Schema/form.model");

const SECRET = process.env.SECRET;

function verifyToken(req, res, next) {
  if (req.headers["authorization"]) {
    // Get auth header value
    const bearerHeader = req.headers["authorization"];

    // Check if auth header is undefined
    if (typeof bearerHeader !== undefined) {
      // split at the space
      const bearer = bearerHeader.split(" ");

      // Get token from array
      const bearerToken = bearer[1];

      // Set token onto the req
      req.token = bearerToken;

      // call next
      next();
    } else {
      return res.sendStatus(403);
    }
  } else {
    return res.json({
      message: "there is no jwt token in the header",
    });
  }
}

router.get("/fill", verifyToken, (req, res) => {
  FormSchema.findOne({}, {}, { sort: { createdAt: -1 } }, (err, doc) => {
    if (err) throw err;
    res.json(doc);
  });
});

router.post(
  "/fill",
  [
    verifyToken,
    body("username")
      .notEmpty()
      .withMessage("username is empty")
      .isString()
      .withMessage("username is not string"),
    body("email").isEmail().normalizeEmail(),
    body("phone")
      .notEmpty()
      .withMessage("phone is empty")
      .isString()
      .withMessage("phone is not string"),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    } else {
      let newForm = new FormSchema(req.body);
      newForm.save((err, doc) => {
        if (err) throw err;
        res.json(doc);
      });
    }
  }
);

router.patch(
  "/fill",
  [
    verifyToken,
    body("id")
      .notEmpty()
      .withMessage("id should not be empty")
      .isString()
      .withMessage("id should be a string"),
    body("field")
      .notEmpty()
      .withMessage("field should not be empty")
      .isString()
      .withMessage("field should be a string"),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    } else {
      var doc_id = req.body.id;
      var delete_field = req.body.field;
      var pathData = {};
      pathData[delete_field] = "";

      FormSchema.findByIdAndUpdate(doc_id, pathData, (err, doc) => {
        if (err) throw err;
        res.json(doc);
      });
    }
  }
);

module.exports = router;
