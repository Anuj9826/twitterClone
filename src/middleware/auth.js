const jwt = require("jsonwebtoken");
const { isValidId } = require("../validator/validation");
const userModel = require("../models/signUpModel");

//************************   Authentication ***********************//

const authentication = async function (req, res, next) {
    try {
      let token = req.headers.authorization;
  
      // if no token found
      if (!token) {
        return res.status(400).send({
          status: false,
          message: "Token required! Please login to generate token",
        });
      }
  
      // This is written here to avoid internal server error (if token is not present)
      token = token.split(" ")[1];
  
      jwt.verify(
        token,
        "secretTokenForProject",
        { ignoreExpiration: true },
        function (error, decodedToken) {
          // if token is invalid
          if (error) {
            return res.status(400).send({
              status: false,
              message: "Token is invalid",
            });
          }
          // if token is valid
          else {
            // if token expired
            if (Date.now() > decodedToken.exp * 1000) {
              return res.status(401).send({
                status: false,
                message: "Session Expired",
              });
            }
            req.userId = decodedToken.userId;
            next();
          }
        }
      );
    } catch (err) {
      res.status(500).send({
        status: false,
        message: "Internal Server Error",
        error: err.message,
      });
    }
  };
  

//*************************** Authorization **********************//

const authorization = async function (req, res, next) {
    try {
        let user = req.body.user;

        // if userId is not a valid ObjectId
        if (!isValidId(user)) {
        res
            .status(400)
            .send({ status: false, message: `${user} is not a valid userId` });
        return;
        }

        // if user does not exist
        let isUserExist = await userModel.findById(user);
        if (!isUserExist) {
        return res
            .status(404)
            .send({ status: false, msg: "user does not exist" });
        }

        // AUTHORISATION
        if (req.body.user !== user) {
        return res.status(401).send({
            status: false,
            message: `Authorisation failed; You are logged in as ${req.user}, not as ${user}`,
        });
        }
        next();
    } catch (err) {
        res.status(500).send({
        status: false,
        message: "Internal Server Error",
        error: err.message,
        });
    }
};

module.exports = { authentication, authorization }