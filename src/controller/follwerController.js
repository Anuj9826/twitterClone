const userModel = require("../models/signUpModel");
const tweetModel = require("../models/tweetModel");
const { isValidId } = require("../validator/validation");

const followUser = async (req, res) => {
  try {
    const userId = req.userId;
    const userToFollowId = req.params.userId;

    if (!isValidId(userToFollowId)) {
      return res.status(400).send({
        status: false,
        message: "userId is invalid",
      });
    }

    // Check if userToFollow exists
    const userToFollow = await userModel.findById(userToFollowId);
    if (!userToFollow) {
      return res.status(400).send({
        status: false,
        message: "User to follow does not exist",
      });
    }

    if (userToFollow.followers.includes(userId)) {
      return res.status(400).send({
        status: false,
        message: "You are already following this user",
      });
    }

    if (userId === userToFollowId) {
      return res.status(400).send({
        status: false,
        message: "You cannot follow yourself",
      });
    }

    // Update the following array of the current user
    const currentUser = await userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { following: userToFollowId } },
      { new: true }
    );

    // Update the followers array of the userToFollow
    const updatedUserToFollow = await userModel.findByIdAndUpdate(
      userToFollowId,
      { $addToSet: { followers: userId } },
      { new: true }
    );

    // Create limited user objects for response
    const limitedCurrentUser = {
      fullName: currentUser.fullName,
      phone: currentUser.phone,
    };

    const limitedUpdatedUserToFollow = {
      fullName: updatedUserToFollow.fullName,
      phone: updatedUserToFollow.phone,
    };

    res.status(200).send({
      status: true,
      message: "User followed successfully",
      currentUser: limitedCurrentUser,
      updatedUserToFollow: limitedUpdatedUserToFollow,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: false, message: error.message });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const userId = req.userId;
    const userIdToUnfollow = req.params.userId;

    if (!isValidId(userIdToUnfollow)) {
      return res.status(400).send({
        status: false,
        message: "userId is invalid",
      });
    }

    // Check if the user to unfollow exists
    const userToUnfollow = await userModel.findById(userIdToUnfollow);
    if (!userToUnfollow) {
      return res.status(400).send({
        status: false,
        message: "User to unfollow does not exist",
      });
    }

    // Check if the current user is not following the userToUnfollow
    if (!userToUnfollow.followers.includes(req.userId)) {
      return res.status(400).send({
        status: false,
        message: "You are not following this user",
      });
    }

    if (userId === userIdToUnfollow) {
      return res.status(400).send({
        status: false,
        message: "You cannot Unfollow yourself",
      });
    }

    // Update the following array of the current user
    const currentUser = await userModel.findByIdAndUpdate(
      req.userId,
      { $pull: { following: userIdToUnfollow } },
      { new: true }
    );

    // Update the followers array of the userToUnfollow
    const updatedUserToUnfollow = await userModel.findByIdAndUpdate(
      userIdToUnfollow,
      { $pull: { followers: req.userId } },
      { new: true }
    );

    // Create limited user objects for response
    const limitedCurrentUser = {
      fullName: currentUser.fullName,
      phone: currentUser.phone,
    };

    const limitedUpdatedUserToUnfollow = {
      fullName: updatedUserToUnfollow.fullName,
      phone: updatedUserToUnfollow.phone,
    };

    res.status(200).send({
      status: true,
      message: "User unfollowed successfully",
      currentUser: limitedCurrentUser,
      updatedUserToUnfollow: limitedUpdatedUserToUnfollow,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: false, message: error.message });
  }
};

const viewTimeline = async (req, res) => {
  try {
    const currentUser = req.userId;

    if (!isValidId(currentUser)) {
      return res.status(400).send({
        status: false,
        message: "userId is invalid",
      });
    }

    const userTimelines = await userModel.findById(currentUser);
    if (!userTimelines) {
      return res.status(400).send({
        status: false,
        message: "User does not exist",
      });
    }

    const currentUserDoc = await userModel.findById(currentUser);
    const followingUsers = currentUserDoc.following;

    // Retrieve tweets from the following users and sort by timestamp
    const timelineTweets = await tweetModel
      .find({ user: { $in: followingUsers } })
      .sort({ timestamp: -1 })
      .populate("user", "fullName");

    res.status(200).send({
      status: true,
      message: "Timeline fetched successfully",
      timelineTweets,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { followUser, unfollowUser, viewTimeline };
