/**
 * User routes
 */
const whoami = "Router:routes/currentUserRoutes.js: ";

const express = require('express');
const router = express.Router();

/**
 * Retrieve Current User from request
 */
router.get('/', function (req, res) {
    // if (req.user) {
    //c onsole.dir('currentuser ENDPOINT')

    if (req.user ) {
        res.status(200).json(req.user);

    } else {
        res.status(200).json({ username: 'no current user' });
    }


});

module.exports = router;
