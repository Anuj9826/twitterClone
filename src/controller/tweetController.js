const tweetModel = require("../models/tweetModel");
const userModel = require("../models/signUpModel");
const {
  isValidString,
  isValidRequest,
  isValidId,
} = require("../validator/validation");
const createTweets = async (req, res) => {
  try {
    let data = req.body;

    // first Check request body is coming or not
    if (!isValidRequest(data)) {
      res.status(400).send({
        status: false,
        Message: "Invalid request parameters. Please provide User details",
      });
      return;
    }

    const { tweet, user } = data;

    // if userId is not a valid ObjectId
    if (!isValidId(user)) {
      return res.status(400).send({
        status: false,
        message: "userId is invalid",
      });
    }

    // if user does not exist
    let userDoc = await userModel.findById(user);
    if (!userDoc) {
      return res.status(400).send({
        status: false,
        message: "user does not exist",
      });
    }

    if (req.userId !== user) {
      return res.status(400).send({
        status: false,
        message: `Authorisation failed; You are logged in as ${req.user}, not as ${user}`,
      });
    }

    if (!isValidString(tweet)) {
      res.status(400).send({ status: false, message: "tweet is mandatory" });
      return;
    }

    let tweetsData = await tweetModel.create(data);
    res.status(201).send({
      status: true,
      message: "tweets created successfully",
      data: tweetsData,
    });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

const updateTweets = async (req, res) => {
  try {
    let tweetId = req.params.tweetId;

    if (!isValidId(tweetId)) {
      return res.status(400).send({
        status: false,
        message: "tweetId is invalid",
      });
    }

    let tweetDoc = await tweetModel.findById(tweetId);
    if (!tweetDoc) {
      return res.status(400).send({
        status: false,
        message: "tweet not exist",
      });
    }

    let data = req.body;

    // first Check request body is coming or not
    if (!isValidRequest(data)) {
      res.status(400).send({
        status: false,
        Message: "Invalid request parameters. Please provide User details",
      });
      return;
    }

    const { tweet, user } = data;

    // if userId is not a valid ObjectId
    if (!isValidId(user)) {
      return res.status(400).send({
        status: false,
        message: "userId is invalid",
      });
    }

    // if user does not exist
    let userDoc = await userModel.findById(user);
    if (!userDoc) {
      return res.status(400).send({
        status: false,
        message: "user does not exist",
      });
    }

    if (req.userId !== user) {
      return res.status(400).send({
        status: false,
        message: `Authorisation failed; You are logged in as ${req.userId}, not as ${userId}`,
      });
    }

    if (!isValidString(tweet)) {
      res.status(400).send({ status: false, message: "tweet is mandatory" });
      return;
    }

    let updateTweet = await tweetModel.findOneAndUpdate(
      { _id: tweetId, user: user },
      { $set: { tweet } },
      { new: true }
    );

    res.status(200).send({
      status: true,
      message: "tweet update",
      data: updateTweet,
    });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

const deleteTweets = async (req, res) => {
  try {
    let tweetId = req.params.tweetId;

    if (!isValidId(tweetId)) {
      return res.status(400).send({
        status: false,
        message: "tweetId is invalid",
      });
    }

    let tweetDoc = await tweetModel.findById(tweetId);
    if (!tweetDoc) {
      return res.status(400).send({
        status: false,
        message: "tweet not exist",
      });
    }

    let data = req.body;

    // first Check request body is coming or not
    if (!isValidRequest(data)) {
      res.status(400).send({
        status: false,
        Message: "Invalid request parameters. Please provide User details",
      });
      return;
    }

    const { user } = data;

    // if userId is not a valid ObjectId
    if (!isValidId(user)) {
      return res.status(400).send({
        status: false,
        message: "userId is invalid",
      });
    }

    // if user does not exist
    let userDoc = await userModel.findById(user);
    if (!userDoc) {
      return res.status(400).send({
        status: false,
        message: "user does not exist",
      });
    }

    if (req.userId !== user) {
      return res.status(400).send({
        status: false,
        message: `Authorisation failed; You are logged in as ${req.userId}, not as ${userId}`,
      });
    }

    await tweetModel.findOneAndDelete({
      _id: tweetId,
      user: user,
    });

    res.status(200).send({
      status: true,
      message: "tweet delete successfully",
    });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { createTweets, updateTweets, deleteTweets };
