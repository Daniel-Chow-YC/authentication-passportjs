# Authentication with PassportJS and Bcrypt

## Authentication Project
- This is a simple project where a user can sign up and login to a website.
- PassportJS was used to setup user authentication with Express
- Used passportjs to allow a user to stay logged in as they move around the app, as passport will use some data to create a cookie which is stored in the user’s browser.
- bcryptjs is used to hash and salt the user's password before it is stored in Mongodb.