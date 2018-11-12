# Tweeter Project

Tweeter is a simple, single-page Twitter clone.

The project in its current form allows for registered users to post their own tweets and favorite the tweets of others.

This project requires connection to a MongoDB database.

## Getting Started

1. Fork this repository, then clone your fork of this repository.
2. Install dependencies using the `npm install` command.
3. Start the web server using the `npm run local` command. The app will be served at <http://localhost:8080/>.
4. Go to <http://localhost:8080/> in your browser.

## Dependencies

- express
- bcryptjs
- body-parser
- cookie-session
- express
- md5
- mongodb
- node 5.10.x or above

## Roadmap

1. Disallow the favoriting of own tweets.
2. Implement re-tweet button.
3. Implement flag button.
4. Create a user settings page to change display name and avatar.
5. Paginate the loading of tweets when users reach the bottom of the feed.
6. More responsive CSS design.
7. Add unit testing.