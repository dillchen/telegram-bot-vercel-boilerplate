import { Telegraf } from 'telegraf';

import { about, appCommand, coinRateCommand, tickerCommand, setupCoinRateHandlers } from './commands';
import { greeting } from './text';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';

const bot = new Telegraf(BOT_TOKEN);

async function setupBot() {
  try {
    // Define bot commands
    const commands = [
      { command: 'start', description: 'Welcome message' },
      { command: 'help', description: 'How to use the bot' },
      { command: 'about', description: 'Information about the bot' },
      { command: 'app', description: 'Access the web app' },
      { command: 'tickers', description: 'Coolest tokens'},
      { command: 'rates', description: 'Get cryptocurrency rates' }
    ];

    // Set bot commands
    await bot.telegram.setMyCommands(commands);
    console.log('Commands set successfully');

    // Set chat menu button
    await bot.telegram.setChatMenuButton({
      menuButton: {
        type: 'commands',
        // Uncomment below to switch to web app menu button
        // type: 'web_app',
        // text: 'Open App',
        // web_app: {
        //   url: 'https://common.xyz'
        // }
      }
    });
    console.log('Web App menu button set successfully');

    // Setup command handlers
    bot.start((ctx) => ctx.reply('Welcome'));
    bot.help((ctx) => ctx.reply('Send me a sticker'));
    bot.command('about', about());
    bot.command('app', appCommand());
    bot.command('tickers', tickerCommand);
    bot.command('rates', coinRateCommand); // Ensure coinRateCommand is a function returning a middleware
    setupCoinRateHandlers(bot); // Setup additional handlers for coin rates
    bot.on('message', (ctx) => {
      // Check if the message is from a group
      if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
        // Handle group-specific logic here
        ctx.reply('Hello group!');
      } else {
        // Handle private chat
        greeting()(ctx);
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
ENVIRONMENT !== 'production' && development(bot);
