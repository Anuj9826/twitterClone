const express = require('express');
const { createUser, loginUser } = require('../controller/signUpController');
const { createTweets, updateTweets, deleteTweets } = require('../controller/tweetController');
const { followUser, unfollowUser, viewTimeline } = require('../controller/follwerController');
const { authentication, authorization } = require('../middleware/auth');
const router = express.Router();

router.post('/register', createUser)
router.post('/login', loginUser)

// tweet api's
router.post("/tweets", authentication, authorization, createTweets);
router.put("/tweets/:tweetId", authentication, authorization, updateTweets);
router.delete("/tweets/:tweetId", authentication, authorization, deleteTweets);

// follow api's
router.post("/follow/:userId", authentication, followUser);
router.post("/unfollow/:userId", authentication, unfollowUser);
router.get("/view/timeline", authentication, viewTimeline)

//Validating the endpoint
router.all("/*", function (req, res) {
    return res
    .status(404)
    .send({ status: false, message: "Page Not Found" });
});

module.exports = router