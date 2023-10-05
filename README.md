# Backend
Node.js and MongoDB based backend for the whole Aurora Ecosystem

Things to add:
* create a list of user stories (all the calls that back end should respond to)
    - there should be a registration request that checks if the email is unique
    (not taken), if correct - return the created user (something like a PUT
    request to /users/ with "email" and "password" that returns the user if
    successful or error message if the email is already taken or the format is wrong)
    - login requests (GET?) to /users with (email and password) OR a unique code
    for mobile (returns the user object if correct or an error message if not)
    - log activity request (POST?) to /users/[id]. There body includes the activity
    name and start-time or finish-time. The server then adds this activity to
    the user's activities list and returns either "success" or "error". This can
    also create a user-action-required event, if the finished activity name differs
    from the unfinished activity name (since both the unfinished activity and the
    started one miss data and require user input).
    - edit (**PATCH** or ~~UPDATE~~?) request allows user to edit the data of
    the recorded activities. In theory, there are datapoints in the Activities
    list, and any change to them should be just send to /users/[id], but the
    implementation might get tricky on either front or backend.
