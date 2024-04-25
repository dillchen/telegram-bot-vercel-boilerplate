import { Telegraf } from 'telegraf';

import { about, appCommand, coinRateCommand, setupCoinRateHandlers } from './commands';
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
    bot.command('rates', coinRateCommand); // Ensure coinRateCommand is a function returning a middleware
    setupCoinRateHandlers(bot); // Setup additional handlers for coin rates
    bot.on('message', greeting());

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
