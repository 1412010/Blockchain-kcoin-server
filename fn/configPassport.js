
var Strategy = require('passport-local'),
    crypto = require('crypto'),
    accountModel = require('../models/accountModel');


module.exports = function (app, passport) {

    // Configure Passport authenticated session persistence.
    //
    // In order to restore authentication state across HTTP requests, Passport needs
    // to serialize users into and deserialize users out of the session.  The
    // typical implementation of this is as simple as supplying the user ID when
    // serializing, and querying the user record by ID from the database when
    // deserializing.

    passport.serializeUser((user, done) => {
        done(null, user.email)
    });

    passport.deserializeUser((email, done) => {
        var condition = {
            _email: email
        };
        accountModel.find(condition, function (error, row) {
            if (error) {
                console.log(error);
                return done(null, false, req.flash('message', 'Login failed!'));
                //return res.status(500).send("Login failed!");
            }

            if (row.length == 0) {
                return done(null, false, req.flash('message', 'Invalid Email or Password'));
                //return res.status(400).send("Invalid email or Password");
            } else {
                if (row[0]._isActive) {
                    var result = {
                        email: row[0]._email,
                        address: row[0]._address,
                        role: row[0]._role,
                        realBalance: row[0]._realBalance,
                        availableBalance: row[0]._availableBalance
                    };
                    // var token = jwt.sign(payload, secretKey);
                    //console.log(result);
                    done(null, result);
                } else {
                    return done(null, false, req.flash('message', "Account is not verified yet!"));
                    //return res.status(403).send("Accont is not actived yet!");
                }
            }
        });
    });

    passport.use('local.login', new Strategy.Strategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, email, password, done) {
        //console.log(req);
        console.log('check login');
        var ePass = crypto.createHash('md5').update(password).digest('hex');
        var condition = {
            _email: email,
            _password: ePass
        };
        accountModel.find(condition, function (error, row) {
            if (error) {
                console.log(error);
                return done(null, false, req.flash('message', 'Login failed!'));
            }

            if (row.length == 0) {
                console.log('Invalid');
                return done(null, false, req.flash('message', 'Invalid Email or Password'));
            } else {
                if (row[0]._isActive) {
                    var result = {
                        email: row[0]._email,
                        address: row[0]._address,
                        role: row[0]._role,
                        realBalance: row[0]._realBalance,
                        availableBalance: row[0]._availableBalance
                    };
                    // var token = jwt.sign(payload, secretKey);
                    //console.log(result);
                    done(null, result);
                } else {
                    return done(null, false, req.flash('message', "Account is not verified yet!"));
                }
            }
        });
    }));
}