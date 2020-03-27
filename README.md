# meet thanksbot

thanksbot is an open source chat app for Slack that records individual messages of affirmation and shares them periodically with your workspace.

## Add to Slack

<a href="https://slack.com/oauth/v2/authorize?client_id=962050889920.989827594197&scope=app_mentions:read,channels:history,channels:join,channels:manage,chat:write,chat:write.customize,groups:history,im:history,im:read,im:write,incoming-webhook,channels:read&redirect_uri=https://thanksbot-app.herokuapp.com/slack/auth">
    <img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x">
</a>


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

To run this app locally, you will need:

* [Node.js](https://nodejs.org/en/download/)
* [NPM](https://www.npmjs.com/get-npm)
* [Postgres](https://www.postgresql.org/download/)

To test features locally, you may also want to [create your own Slack workspace](https://slack.com/create#email) and use [ngrok](https://ngrok.com/) to serve a publicly available URL to your local bot. This will allow you to use your local server URL in your test Slack workspace setting.

### Installing

1) Clone repo and change into the project directory
2) Create a local .env file in the root of your project to manage your development Slack app's secrets. A lot of these values will come from your Slack app's "Basic Information" page in your app's Slack UI.

Below are the .env values you will need:

```
CIPHER_KEY='choose a string'
CIPHER_IV='a different string here'
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_REDIRECT_URI=<use your ngrok URL here>/slack/auth
SLACK_SIGNING_SECRET=
```

3) Run `npm install` to install dependencies
4) To set up the database, enter `npm run db-init-local`
5) Next enter `npm run migrate-up` to run database migrations.
6) Finally start your local server with `npm run dev`

### Managing Database Changes

We are managing database changes with [DB Migrate](https://db-migrate.readthedocs.io/en/latest/).

#### Create a New Migration

To create a new set of database changes, enter `npm run migrate-create <name of your migration here>` and substitute the angle brackets with your desired file name in kabob case. This will create a new file in `migrations` where you can fill in your desired database changes.

Once your migration is created, you can apply it to the database with `npm run migrate-up` and undo it with `npm run migrate-down`.

### Slack Workspace Setup

To recreate this bot in your local environment, there are some changes you will need to make in your dev app's Slack UI.

* "Incoming Webhooks" - switch this feature to "On"
* "Interactivity & Shortcuts"
    * Switch to "On"
    * Add a request URL `<your ngrok URL here>/slack/interactions`
* "OAuth & Permissions"
    * Add a request URL `<your ngrok URL here>/slack/auth`
    * Request the following scopes:
        * app_mentions:read
        * channels:history
        * channels:join
        * channels:manage
        * channels:read
        * chat:write
        * chat:write.customize
        * groups:history
        * im:history
        * im:read
        * im:write
* "Event Subscriptions"
    * Switch to "On"
    * Add a request URL `<your ngrok URL here>/slack/events`. You will need to [verify your local server](https://github.com/slackapi/node-slack-sdk#listening-for-an-event-with-the-events-api) before being able to save this URL.
    * Subscribe to the events `message.channels` and `message.im`

Finally head to "Install App" to add your dev app to your test Slack workspace. This will allow you to DM your test bot and have your local server respond.

### Handy Scripts

When you're working on thanksbot, you may the following scripts helpful:

`npm run list-message <slack team id>` - this command will show all of the messages your bot currently has scheduled. For a simple way to find the team id in the Slack UI, take a look at [this Stack Overflow Post.](https://stackoverflow.com/questions/40940327/what-is-the-simplest-way-to-find-a-slack-team-id-and-a-channel-id)

`node ./scripts/reminderJob.js` - if you are working on the reminder functionality, this command will post a reminder message to the #general channel


### Coding style

We're using Prettier and Eslint for maintaining code style consistency. You can use `npm run prettier` to automatically format your code and then `npm run lint` to detect any further style problems you need to resolve before submitting a PR.


## Deployment

This bot is hosted on Heroku. It uses the `master` branch for deployment and is [deployed manually.](https://devcenter.heroku.com/articles/github-integration#manual-deploys) [Heroku Scheduler](https://devcenter.heroku.com/articles/scheduler) executes the script to post a reminder message every week. This script runs daily since Scheduler doesn't offer a weekly cadence, but the script itself [checks if the reminder should be posted that day](https://github.com/workingdirectory/thanksbot/blob/master/scripts/reminderJob.js#L18) and then posts if so.


## Contributing

Try thanksbot out in your organization or community workspace (you may need to get a workspace administrator to install it for you):

* If you find a bug, or think of a feature request, [file an issue](https://github.com/workingdirectory/thanksbot/issues) first so we can document it.
* Want to send in a PR? Fork the repo and issue a PR from your fork:
  * Please cite any issues the PR addresses from the [issue tracker]()
  * Please lint your code before submitting
  * Please test your code locally before submitting
* Wait for review - we will try to review PRs within 5 days of submission, but please be patient.

thanksbot is maintained by [@jorydotcom]() and [@kbroida](https://twitter.com/kbroida).

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments
