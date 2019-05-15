var express = require("express");
var router = express.Router();
var rp = require("request-promise");
var User = require("../models/user");
var constants = require("../config/constants");

var GroupRequest = require("../models/grouprequest");
var multer = require("multer");
var multerS3 = require("multer-s3");
var aws = require("aws-sdk");
aws.config.update(constants["amazon-s3"]);
var s3 = new aws.S3();
var mailgun = require("mailgun-js")({
  apiKey: constants.mailgun.api_key,
  domain: constants.mailgun.DOMAIN
});
var authy = require("authy")(constants.twilio.authyApiKey);
var nodemailer = require("nodemailer");

var Mixpanel = require("mixpanel");
var mixpanel = Mixpanel.init("37ce63f0126b1775a23b5e3facd16807");
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "Tribifeedback@gmail.com",
    pass: "Tribiappdevelopment"
  }
});
// var upload = multer({ dest: 'public/photouploads/' })
var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "tribeupload",
    acl: "public-read",
    metadata: function(req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function(req, file, cb) {
      cb(null, Date.now().toString());
    }
  })
});
// GET route for reading data

router.post("/signin", function(req, res) {
  let email_l = req.body.email.toLowerCase();

  User.findOne({ email: email_l }, function(err, user) {
    if (err) throw err;
    if (!user) {
      return res.json({
        success: false,
        error: constants.errors.user.auth_fail
      });
    } else {
      if (!user.authyId) {
        authy.register_user(
          email_l,
          user.phonenumber,
          user.countrycode,
          function(err, response) {
            if (err) {
              console.log(err);
              return res.json({
                success: false,
                error: constants.errors.invalid_phone
              });
            }
            user.authyId = response.user.id;
            user.save(function(err, doc) {
              if (err) {
                console.log(err);
                return res.json({
                  success: false,
                  error: constants.errors.server_error
                });
              } else {
                if (user.recover_password == req.body.password) {
                  sendUserInfo(user, true);
                } else {
                  // check if password matches
                  user.comparePassword(req.body.password, function(
                    err,
                    isMatch
                  ) {
                    if (isMatch && !err) {
                      // if user is found and password is right create a token
                      // var token = jwt.sign(user, config.secret);
                      // return the information including token as JSON
                      sendUserInfo(user, false);
                    } else {
                      return res.json({
                        success: false,
                        error: constants.errors.user.auth_fail
                      });
                    }
                  });
                }
              }
            });
          }
        );
      } else {
        if (user.recover_password == req.body.password) {
          sendUserInfo(user, true);
        } else {
          // check if password matches
          user.comparePassword(req.body.password, function(err, isMatch) {
            if (isMatch && !err) {
              // if user is found and password is right create a token
              // var token = jwt.sign(user, config.secret);
              // return the information including token as JSON
              sendUserInfo(user, false);
            } else {
              return res.json({
                success: false,
                error: constants.errors.user.auth_fail
              });
            }
          });
        }
      }
      function sendUserInfo(user, isrecovered) {
        GroupRequest.find({
          $and: [
            { user_id: user._id },
            { status: constants.groupjoinrequeststatus.pending }
          ]
        })
          .populate("group", "-__v")
          .exec(function(err, join_requests) {
            let host = `${req.protocol}://${req.headers.host}`;
            user.photo = user.photo
              ? user.photo
              : `${host}/images/default_user.png`;
            return res.json({
              success: true,
              data: {
                user: user,
                isrecovered: isrecovered,
                grouprequest: join_requests
              }
            });
          });
      }
    }
  });
});
router.post("/send_two_step_vcode", function(req, res) {
  let authyId = req.body.authyId;
  User.findOne({ authyId: authyId }, function(err, user) {
    if (err) throw err;
    if (!user) {
      return res.json({
        success: false,
        error: constants.errors.user.auth_fail
      });
    } else {
      authy.request_sms(authyId, function(err, response) {
        if (err) {
          console.info(err);
          return res.json({
            success: false
          });
        } else {
          return res.json({
            success: true
          });
        }
      });
    }
  });
});
router.post("/verify_two_step_vcode", function(req, res) {
  let authyId = req.body.authyId;
  let otp = req.body.otp;
  User.findOne({ authyId: authyId }, function(err, user) {
    if (err) throw err;
    if (!user) {
      return res.json({
        success: false,
        error: constants.errors.user.auth_fail
      });
    } else {
      authy.verify(authyId, otp, function(err, response) {
        if (err) {
          console.info(err);
          return res.json({
            success: false
          });
        } else {
          return res.json({
            success: true
          });
        }
      });
    }
  });
});
router.post("/send_phone_verify_code", function(req, res) {
  let phonenumber = req.body.phone_number
  let countrycode = req.body.country_code
  let email_l = `tribirandomemail${Date.now()}@gmail.com`
  authy.register_user(
    email_l,
    phonenumber,
    countrycode,
    function(err, response) {
      if (err) {
        console.log(err);
        return res.json({
          success: false,
          error: constants.errors.invalid_phone
        });
      }
      let authyId = response.user.id
      authy.request_sms(authyId, function(err, response) {
        if (err) {
          console.info(err);
          return res.json({
            success: false
          });
        } else {
          return res.json({
            success: true,
            authyId: authyId
          });
        }
      });
    }
  );
})
router.post("/verify_phone_vcode", function(req, res) {
  let authyId = req.body.authyId;
  let otp = req.body.otp;
  authy.verify(authyId, otp, function(err, response) {
    if (err) {
      console.info(err);
      return res.json({
        success: false
      });
    } else {
      return res.json({
        success: true
      });
    }
  });
});
//POST route for updating data
router.post("/signup", function(req, res) {
  let phonenumber = req.body.phonenumber;
  let countrycode = req.body.countrycode;
  let phone = `+${countrycode}${phonenumber}`;
  let photo = req.body.photo;
  let email_l = req.body.email.toLowerCase();
  let authyId = req.body.authyId;

  User.findOne({ $or: [{ email: email_l }, { phone: phone }] }, function(
    err,
    user
  ) {
    if (user) {
      if (user.email == email_l) {
        return res.json({
          success: false,
          error: constants.errors.user.duplicated_email
        });
      } else {
        return res.json({
          success: false,
          error: constants.errors.user.duplicated_phone
        });
      }
    } else {
      var newUser = new User({
        username: req.body.username,
        password: req.body.password,
        phonenumber: req.body.phonenumber,
        countrycode: req.body.countrycode,
        phone: `+${countrycode}${phonenumber}`,
        email: email_l,
        photo: photo,
        authyId: authyId
      });
      newUser.save(function(err, doc) {
        if (err) {
          console.log(err);
          return res.json({
            success: false,
            error: constants.errors.server_error
          });
        } else {
          mixpanel.people.set(phone, {
            phone: phone,
            email: email_l,
            name: req.body.username,
            created: new Date().toISOString()
          });

          return res.json({
            success: true,
            data: {
              user: newUser
            }
          });
        }
      });
    }
  });
});

//POST route for updating data
router.post("/update_profile", function(req, res) {
  let user_id = req.body.user_id;
  let location = req.body.location;
  let username = req.body.username;
  let description = req.body.description;
  let password = req.body.password;
  let email_l = req.body.email.toLowerCase();
  // let phonenumber = req.body.phonenumber
  // let countrycode = req.body.countrycode
  // let phone = `+${countrycode}${phonenumber}`

  User.findOne({ email: email_l }, function(err, usercheck) {
    if (usercheck && usercheck._id != user_id) {
      return res.json({
        success: false,
        error: constants.errors.user.duplicated_email
      });
    } else {
      User.findById(user_id, function(err, user) {
        if (err) {
          return res.json({
            success: false,
            error: constants.errors.server_error
          });
        } else {
          if (!user) {
            return res.json({
              success: false,
              error: constants.errors.user.user_not_found
            });
          } else {
            user.username = username;
            user.location = location;
            user.description = description;
            user.password = password;
            // save the user
            user.save((err, doc) => {
              if (err) {
                return res.json({
                  success: false,
                  error: constants.errors.server_error
                });
              } else {
                let host = `${req.protocol}://${req.headers.host}`;
                doc.photo = doc.photo
                  ? doc.photo
                  : `${host}/images/default_user.png`;
                return res.json({
                  success: true,
                  data: {
                    user: doc
                  }
                });
              }
            });
            // User.findOneAndUpdate({_id: user_id},{ $set:  newuser},{ new: true },  function(err, doc) {

            // });
          }
        }
      });
    }
  });
});

router.post("/upload_photo", upload.single("photo"), function(req, res) {
  let user_id = req.body.user_id;
  let photo = req.file.location;
  if (user_id == 0) {
    return res.json({ success: true, photo: photo });
  } else {
    User.findById(user_id, function(err, user) {
      if (err) {
        return res.json({
          success: false,
          error: constants.errors.server_error
        });
      } else {
        if (!user) {
          return res.json({
            success: false,
            error: constants.errors.user_not_found
          });
        } else {
          user.photo = photo;
          // save the user
          User.findOneAndUpdate(
            { _id: user_id },
            { $set: { photo: photo } },
            { new: true },
            function(err, doc) {
              if (err) {
                return res.json({
                  success: false,
                  error: constants.errors.server_error
                });
              } else {
                let host = `${req.protocol}://${req.headers.host}`;
                doc.photo = doc.photo
                  ? doc.photo
                  : `${host}/images/default_user.png`;
                return res.json({
                  success: true,
                  data: {
                    user: doc
                  }
                });
              }
            }
          );
        }
      }
    });
  }
});
router.post("/reset_password", function(req, res) {
  var subject = "FourSquare recovery password.";
  var randomPass = Math.random()
    .toString(36)
    .substring(6);
  var html = `Your temp password is <strong>${randomPass}</strong><br>`;
  let email_l = req.body.email.toLowerCase();

  User.findOne({ email: email_l }, function(err, user) {
    if (err) {
      return res.json({ success: false, error: constants.errors.server_error });
    } else {
      if (user) {
        user.recover_password = randomPass;
        user.save(function(err, newuser) {
          if (err) {
            return res.json({
              success: false,
              error: constants.errors.server_error
            });
          } else {
            var mailOptions = {
              from: constants.frommail,
              to: user.email,
              subject: subject,
              html: html
            };

            transporter.sendMail(mailOptions, function(error, info) {
              if (error) {
                return res.json({
                  success: false,
                  error: constants.errors.mailsend_error
                });
              } else {
                return res.json({ success: true, data: {} });
              }
            });
          }
        });
      } else {
        return res.json({
          success: false,
          error: constants.errors.user.user_not_found
        });
      }
    }
  });
});

// GET route after registering
router.get("/profile", function(req, res, next) {
  User.findById(req.session.userId).exec(function(error, user) {
    if (error) {
      return next(error);
    } else {
      if (user === null) {
        var err = new Error("Not authorized! Go back!");
        err.status = 400;
        return next(err);
      } else {
        return res.send(
          "<h1>Name: </h1>" +
            user.username +
            "<h2>Mail: </h2>" +
            user.email +
            '<br><a type="button" href="/logout">Logout</a>'
        );
      }
    }
  });
});

// GET for logout logout
router.get("/logout", function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect("/");
      }
    });
  }
});

router.post("/set_favorite_venue", function(req, res) {
  let user_id = req.body.user_id;
  let venue_id = req.body.venue_id;

  User.findById(user_id, function(err, user) {
    if (err) {
      return res.json({ success: false, error: constants.errors.server_error });
    } else {
      if (!user) {
        return res.json({
          success: false,
          error: constants.errors.user.user_not_found
        });
      } else {
        let oldvenue = user.favorite_venues.filter(function(item) {
          return item == venue_id;
        });
        if (oldvenue.length > 0) {
          return res.json({
            success: false,
            error: constants.errors.group_error.duplicated_venue
          });
        } else {
          let newfavorite_venues = user.favorite_venues;
          newfavorite_venues.push(venue_id);
          // save the user
          User.findOneAndUpdate(
            { _id: user_id },
            { $set: { favorite_venues: newfavorite_venues } },
            { new: true },
            function(err, doc) {
              if (err) {
                return res.json({
                  success: false,
                  error: constants.errors.server_error
                });
              } else {
                return res.json({
                  success: true,
                  data: {
                    user: doc
                  }
                });
              }
            }
          );
        }
      }
    }
  });
});
router.post("/unset_favorite_venue", function(req, res) {
  let user_id = req.body.user_id;
  let venue_id = req.body.venue_id;
  User.findById(user_id, function(err, user) {
    if (err) {
      return res.json({ success: false, error: constants.errors.server_error });
    } else {
      if (!user) {
        return res.json({
          success: false,
          error: constants.errors.user.user_not_found
        });
      } else {
        let oldvenue = user.favorite_venues.filter(function(item) {
          return item == venue_id;
        });
        if (oldvenue.length > 0) {
          let newfavorite_venues = user.favorite_venues;
          newfavorite_venues.splice(venue_id, 1);
          // save the user
          User.findOneAndUpdate(
            { _id: user_id },
            { $set: { favorite_venues: newfavorite_venues } },
            { new: true },
            function(err, doc) {
              if (err) {
                return res.json({
                  success: false,
                  error: constants.errors.server_error
                });
              } else {
                return res.json({
                  success: true,
                  data: {
                    user: doc
                  }
                });
              }
            }
          );
        } else {
          return res.json({
            success: false,
            error: constants.errors.group_error.not_found
          });
        }
      }
    }
  });
});
router.post("/get_favorite_venues", function(req, res) {
  let user_id = req.body.user_id;
  console.log(user_id);
  User.findById(user_id, function(err, user) {
    if (err) {
      return res.json({ success: false, error: constants.errors.server_error });
    } else {
      if (!user) {
        return res.json({
          success: false,
          error: constants.errors.user.user_not_found
        });
      } else {
        let promises = [];
        for (var index = 0; index < user.favorite_venues.length; index++) {
          var venuepromise = rp({
            url: `https://api.foursquare.com/v2/venues/${
              user.favorite_venues[index]
            }`,
            method: "GET",
            qs: {
              client_id: constants.foursquare.ClientID,
              client_secret: constants.foursquare.ClientSecret,
              v: "20180323"
            }
          });
          promises.push(venuepromise);
        }
        let data = [];
        Promise.all(promises)
          .then(function(values) {
            for (var index = 0; index < values.length; index++) {
              var element = values[index];
              let result = JSON.parse(element).response.venue;
              let onedata = {
                id: result.id,
                name: result.name,
                category:
                  result.categories.length > 0
                    ? result.categories[0].name
                    : "Undefined",
                description: result.description,
                photos:
                  result.photos.groups.length > 0
                    ? result.photos.groups[0].items.map(elem => {
                        return {
                          url: elem.prefix + elem.width + elem.suffix
                        };
                      })
                    : [],
                tips:
                  result.photos.groups.length > 0
                    ? result.tips.groups[0].items.map(it => {
                        return {
                          text: it.text,
                          agreeCount: it.agreeCount,
                          disagreeCount: it.disagreeCount,
                          createdAt: it.createdAt,
                          user: it.user.firstName
                        };
                      })
                    : [],
                latlng: {
                  latitude: result.location.lat,
                  longitude: result.location.lng
                }
              };
              data.push(onedata);
            }
            return res.json({ success: true, data: data });
          })
          .catch(function(e) {
            console.log(e);
            return res.json({
              success: false,
              error: constants.errors.server_error
            });
          });
      }
    }
  });
});
router.post("/sendfeedback", function(req, res) {
  var comment = req.body.comment;

  var subject = "App Feedback";
  var mailOptions = {
    from: constants.frommail,
    to: "Tribifeedback@gmail.com",
    subject: subject,
    html: comment
  };
  transporter.sendMail(mailOptions, function(error, info) {
    console.log(error);
    console.log(info);
    if (error) {
      return res.json({
        success: false,
        error: constants.errors.mailsend_error
      });
    } else {
      return res.json({ success: true, data: {} });
    }
  });
});
module.exports = router;
