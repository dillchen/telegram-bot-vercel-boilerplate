import { Markup, Telegraf, session } from 'telegraf';

import {
  about,
  appCommand,
  coinRateCommand,
  setupLaunchCommand,
  setupTradeCommand
} from './commands';
import { greeting } from './text';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';
import { MyContext } from './types';
import { webAppUrl } from './utils/constants';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';
const ALLOWED_GROUP_USERNAME = '@testingbot1111111';

const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN!);


async function setupBot() {
  try {
    // Define bot commands

    bot.use(session({
      defaultSession: (): MyContext['session'] => ({
        state: null,
        communityData: {},
        tradeData: { ticker: '', amount: 0, action: 'buy' }
      })
    }));

    bot.command('app', appCommand());
    setupLaunchCommand(bot); // sets up /launch command via commands/launch
    setupTradeCommand(bot); // sets up /buy and /sell command via commands/trade
    bot.command('help', (ctx) => ctx.reply('How to use the bot'));
    bot.command('about', about());
    bot.command('rates', coinRateCommand);
    

    const commands = [
      { command: 'app', description: 'Access the web app' },
      { command: 'launch', description: 'Launch a coin--with built rewards and community' },
      { command: 'help', description: 'How to use the bot' },
      { command: 'about', description: 'Information about the bot' },
      { command: 'buy', description: 'Buy a token' },
      { command: 'sell', description: 'Sell a token' },
    ];

    // Set bot commands
    await bot.telegram.setMyCommands(commands);
    console.log('Commands set successfully');

    // Set chat menu button
    await bot.telegram.setChatMenuButton({
      menuButton: {
        type: 'web_app',
        text: 'Open App',
        web_app: {
          url: webAppUrl
        }
      }
    });
    console.log('Web App menu button set successfully');

    const isAllowedGroup = (chatUsername: string | undefined): boolean => {
      return chatUsername === ALLOWED_GROUP_USERNAME.replace('@', '');
    };

    const welcomeMessage = `
    🪙 Welcome to Common: coin, click, earn, vote

    💰 Coin your idea: each message can become a coin
    🎁 Reward your community: each action, like reaction or msg can earn coins
    🛒 Buy coins or click to earn coins
    🗳️ Use coins to vote on things to do
    `;

    const welcomeMessageWithButton = Markup.inlineKeyboard([
      Markup.button.url('Open Bot', 'https://t.me/v0_1CommonLaunchBot')
    ]);

    bot.telegram.setMyDescription(welcomeMessage.trim());

    // Refactor bot.start
    bot.start((ctx) => {
      ctx.replyWithPhoto(
        { source: './static/image.png' },
        {
          caption: `${welcomeMessage}`,
          parse_mode: 'MarkdownV2',
          ...welcomeMessageWithButton
        }
      );
    });
    bot.help((ctx) => ctx.reply('Send me a sticker'));
    // bot.command('rates', coinRateCommand);
    bot.on('message', (ctx) => {
      console.log('Received a message');
      if ('username' in ctx.chat && isAllowedGroup(ctx.chat.username)) {
        // Handle allowed group-specific logic here
        ctx.replyWithPhoto(
          { source: './static/image.png' },
          {
            caption: `${welcomeMessage}`,
            parse_mode: 'MarkdownV2',
            ...welcomeMessageWithButton
          }
        );
        // ctx.reply('Hello allowed group!');
      } else if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
        // Handle other group-specific logic here
        ctx.reply('Hello group!');
      } else {
        // Handle private chat
        // greeting()(ctx);
      }
    });

    // Log when receiving a reaction update and respond if thumbs up
    bot.on('message_reaction', (ctx) => {
      console.log('Received a message reaction:', ctx.update);

      const hasThumbsUp = ctx.update.message_reaction.new_reaction.some(reaction => 
        reaction.type === 'emoji' && reaction.emoji === '👍'
      );
      
      if (hasThumbsUp) {
        ctx.reply('Registered your upvote: 👍, this is now in 3rd place');
      }
    });

    // Log when receiving a message reaction count update
    bot.on('message_reaction_count', (ctx) => {
      console.log('Received a message reaction count update:', ctx.update);
    });

    // Add a catch-all handler to see if any updates are coming through
    bot.use((ctx) => {
      console.log('Received an update:', ctx.update);
    });

    bot.catch((err, ctx) => {
      console.error('An error occurred during bot execution:', err);
      console.log('Context of the error:', ctx);
    });
    // Launch the bot in long-polling mode
    console.log('Bot launched successfully');
  } catch (error) {
    console.error('Failed to setup the bot:', error);
  }
}

setupBot();

//prod mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};
//dev mode
ENVIRONMENT !== 'production' && development(bot).catch(error => {
  console.error('Main: Error in development mode:', error);
});