const userModel = require("../models/signUpModel");
const {
  isValidRequest,
  isValidString,
  isValidName,
  isValidLength,
  isValidMail,
  isValidPassword,
  isConfirmPasswordMatch,
  hashPassword,
  isValidPhone,
} = require("../validator/validation");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt')

//>>>>>>>>>>>>>>>>>>>>>>>>>> Register User <<<<<<<<<<<<<<<<<<<<<<<<<<<<<//

const createUser = async function (req, res) {
  try {
    const data = req.body;

    // check data is coming or not
    if (!isValidRequest(data)) {
      res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide User details",
      });
      return;
    }

    let { fullName, email, password, confirmPassword, phone  } = data;

    // check full name should be an string
    if (!isValidString(fullName)) {
      res.status(400).send({ status: false, message: "fullName is mandatory" });
      return;
    }

    // Check full Name is valid or not
    if (!isValidName(fullName)) {
      res.status(400).send({ status: false, message: "fullName is not a valid name" });
      return;
    }

    // check full name does not contain the number
    let validString = /\d/;
    if (validString.test(fullName))
      return res.status(400).send({ status: false, msg: "fullName must be valid it should not contains numbers" });

    // check full name not be greather than 50 characters
    if(!isValidLength(fullName)) {
      res.status(400).send({ status: false, message: "fullName exceeds the maximum length limit" });
    }

    // Check Email is Coming or not
    if (!isValidString(email)) {
      res.status(400).send({ status: false, message: "email is required" });
      return;
    }

    // check coming email is Validate or not
    if (!isValidMail(email)) {
      res.status(400).send({ status: false, message: "email is invalid" });
      return;
    }

    // Check email is Duplicate or not
    const isExistEmail = await userModel.findOne({ email: email });
    if (isExistEmail) {
      res.status(400).send({ status: false, message: "this Email belong to other user" });
      return;
    }

    // Check Password is Coming Or not
    if (!isValidString(password)) {
      res.status(400).send({ status: false, message: "password is required" });
      return;
    }

    // Check password is correct format or not
    if (!isValidPassword(password)) {
      res.status(400).send({ status: false, message: "password must be 8-15 characters long consisting of atleast one number, uppercase letter, lowercase letter and special character" });
      return;
    }

    // Check confirm Password is Coming Or not
    if (!isValidString(confirmPassword)) {
      res.status(400).send({ status: false, message: "confirm password is required" });
      return;
    }

    // Check confirm password is match with entered password or not
    if (!isConfirmPasswordMatch(password, confirmPassword)) {
      res.status(400).send({ status: false, message: "confirm password must match the entered password" })
      return;
    }

    const hashPass = await hashPassword(password);
    data.password = hashPass;

    // check phone number is coming or not
    if (!isValidString(phone)) {
      res.status(400).send({ status: false, message: "phone number is mandatory" });
      return;
    }

    // Validate the Phone Number
    if (!isValidPhone(phone)) {
      res.status(400).send({ status: false, message: "phone number is not a valid" });
      return;
    }

    // Check Duplicate Phone Number
    const isExistPhone = await userModel.findOne({ phone: phone });
    if (isExistPhone) {
      res.status(400).send({ status: false, message: "this phone number belong to other user" });
      return;
    }

    // Object Destructing
    let finalData = {
      fullName,
      email, 
      password: hashPass, 
      confirmPassword: hashPass, 
      phone, 
    };

    // Finally Create The User Details After Validation
    let userData = await userModel.create(finalData);
    res.status(201).send({
      status: true,
      message: "User created successfully",
      data: userData,
    });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//>>>>>>>>>>>>>>>>>>>>>>>>>> Login User <<<<<<<<<<<<<<<<<<<<<<<<<<<<<//

const loginUser = async (req, res) => {
  try {
    let data = req.body;

    // first Check request body is coming or not
    if (!isValidRequest(data)) {
      res.status(400).send({ status: false, Message: "Invalid request parameters. Please provide User details" });
      return;
    }

    const { email, password } = data;

    // Check Email is Coming Or not
    if (!isValidString(email)) {
      res.status(400).send({ status: false, message: "Email is required" });
      return;
    }

    // Validate Email
    if (!isValidMail(email)) {
      res.status(400).send({ status: false, message: "Email is invalid" });
      return;
    }

    // Check password is Coming Or not
    if (!isValidString(password)) {
      res.status(400).send({ status: false, message: "password is required" });
      return;
    }

    // Validate password
    if (!isValidPassword(password)) {
      res.status(400).send({ status: false, message: "It is not valid password" });
      return;
    }

    // Check Email and password is Present in DB
    let user = await userModel.findOne({ email: email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({
        status: false,
        msg: "Email or password does not match, Invalid login Credentials",
      });
    }

    // Generate Token
    let token = jwt.sign(
      {
        userId: user._id.toString(),
        iat: new Date().getTime() / 1000,
      },
      "secretTokenForProject",
      { expiresIn: "1h" }
    );

    // send response to  user that Author is successfully logged in
    res.status(200).send({
      status: true,
      message: "User login successfully",
      data: { userId: user._id, token: token },
    });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { createUser, loginUser };