# Telegram Bot Vercel Boilerplate

Telegram Bot Vercel Boilerplate based on Node.js and [Telegraf](https://github.com/telegraf/telegraf) framework.

This template inspired by [Telegram Bot Boilerplate](https://github.com/yakovlevyuri/telegram-bot-boilerplate) for easily deploy to [Vercel](https://vercel.com).

[![Live Demo](https://img.shields.io/badge/Medium-12100E?style=for-the-badge&logo=medium&logoColor=white)](https://medium.com/@7rodma/deploy-a-serverless-telegram-chatbot-using-vercel-57665d942a58)

## Before you start

First rename `.env-sample` file to `.env` and fill in all necessary values.

```
BOT_TOKEN="<YOUR_BOT_API_TOKEN>"
```

## Start your local server

```
yarn
yarn dev
```

## Production

You can fork this template and do the necessary changes you need. Then you when are done with your changes simply goto [vercel git import](https://vercel.com/import/git).

Reference to [this update](https://vercel.com/docs/security/deployment-protection#migrating-to-standard-protection), you need turn off `Vercel Authentication`, Settings => Deployment Protection

Feel free to create PR!

## Demo

You can see a working version of the bot at [@Node_api_m_bot](https://t.me/Node_api_m_bot)

------
Experiments

1. Grab API Route from Common
2. Test Listening to Messages and Check for Reaction

To Do for Spike for ICs?
0. Test Event Emitting from Common Outbox
1. Deleting messages as part of flow, and holding a little bit more complex state
2. Actually making a transaction
3. Grab Price Info + Format https://commonwealth.im/api/v1/community.getStakeHistoricalPrice?batch=1&input=%7B%220%22%3A%7B%22past_date_epoch%22%3A1713975884.337%7D%7D
