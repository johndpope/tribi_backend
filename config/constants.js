module.exports = {
  base_url: "https://vast-taiga-29858.herokuapp.com",
  applink:
    "https://itunes.apple.com/ca/app/tribi/id1363186052?mt=8",
  androidlink: "https://play.google.com/store/apps/details?id=com.tribi.Tribi",
  secret: "nodeauthsecret",
  frommail: "Tribifeedback@gmail.com",
  mailgun: {
    api_key: "key-0e4228878343f000e39d52fff01ff844",
    DOMAIN: "mail.dinnerbell.co",
    from: "Tribi <postmaster@mail.dinnerbell.co>"
  },
  foursquare: {
    ClientID: process.env.FOURSQUARE_ID,
    ClientSecret: process.env.FOURSQUARE_PASS
  },
  admin_site_url: "localhost://",
  twilio: {
    accountSid: process.env.TWILIO_ID,
    authToken: process.env.TWILIO_AUTHTOKEN,

    // A Twilio number you control - choose one from:
    // https://www.twilio.com/user/account/phone-numbers/incoming
    // Specify in E.164 format, e.g. "+16519998877"
    twilioNumber: "+16474964052 ",

    // Your Authy production key - this can be found on the dashboard for your
    // Authy application
    authyApiKey: process.env.AUTHY_API_KEY, // 'LiyUO1HS5iPZr4MQ12VvZfmb1j1QrS74' ,
  },
  "amazon-s3": {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: "us-east-1"
  },
  fcm_server_key: process.env.FCM_SERVERKEY,
  roleingroup: {
    creator: "creator",
    member: "member"
  },
  groupjoinrequeststatus: {
    pending: "pending",
    accepted: "accepted",
    rejected: "rejected"
  },
  main_menus: [
    "breakfast",
    "brunch",
    "lunch",
    "daily specials",
    "drink",
    "desert",
    "dog"
  ],
  pusher: {
    appId: "487456",
    key: "760d4bd616622b123992",
    secret: "c50acab890efb39b399a",
    cluster: "us2"
  },
  status: {
    approved: "approved",
    rejected: "rejected",
    pending: "pending"
  },
  errors: {
    group_name_length_short: {
      status: "group_name_length_short",
      message: "Group name should be longer than 4 letters"
    },
    invalid_params: {
      status: "invalid_params",
      message: "Invalid parameter posted"
    },
    invalid_phone: {
      status: "invalid_phone",
      message: "Invalid phone number"
    },
    server_error: {
      status: "server_error",
      message: "There are errors in server"
    },
    not_found: {
      status: "not_found",
      message: "Not found"
    },
    group_error: {
      duplicated_group: {
        status: "duplicated_group",
        message: "Duplicated group exist"
      },
      duplicated_venue: {
        status: "duplicated_venue",
        message: "Duplicated venue exist"
      },
      duplicated_comment: {
        status: "duplicated_comment",
        message: "You commented already"
      },
      group_not_found: {
        status: "group_not_found",
        message: "Not found group"
      },
      venue_not_found: {
        status: "venue_not_found",
        message: "Not found venue"
      }
    },
    user: {
      duplicated_email: {
        status: "duplicated_email",
        message: "The email address that you have entered is already registered"
      },
      duplicated_phone: {
        status: "duplicated_phone",
        message:
          "The phone number that you have entered is already registered with an existing account"
      },
      duplicated_account: {
        status: "duplicated_account",
        message: "Duplicated account exist"
      },
      user_not_found: {
        status: "user_not_found",
        message: "Not found user"
      },
      auth_fail: {
        status: "not_found",
        message: "Incorrect login information"
      },
      incorrect_old_password: {
        status: "not_found",
        message: "Old password not matches!"
      },
      authorization_error: {
        status: "not_authorized",
        message: "You have not right to access"
      },
      pending: {
        status: "pending",
        message: "Your account is not approved yet."
      },
      rejected: {
        status: "rejected",
        message: "Your account is rejected."
      },
      verify_failed: {
        status: "incorrect_verification",
        message: "Verification Info is incorrect"
      }
    }
  }
};
