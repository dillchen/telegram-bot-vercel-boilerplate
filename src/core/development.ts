import { Context, Telegraf } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import createDebug from 'debug';
import { MyContext } from '../types';

const debug = createDebug('bot:dev');

const development = async (bot: Telegraf<MyContext>) => {
  console.log('1. Starting development mode setup...');
  try {
    console.log('2. Getting bot info...');
    const botInfo = (await bot.telegram.getMe()).username;

    console.log('3. Deleting webhook...');
    await bot.telegram.deleteWebhook();

    console.log('4. Preparing to launch bot...');

    await bot.launch({
      allowedUpdates: ['message', 'message_reaction', 'message_reaction_count', 'callback_query']
    }).then(() => {
      console.log('5. Bot launched successfully in development mode');
    });

    process.once('SIGINT', () => {
      console.log('6. Received SIGINT. Stopping bot...');
      bot.stop('SIGINT');
    });
    process.once('SIGTERM', () => {
      console.log('7. Received SIGTERM. Stopping bot...');
      bot.stop('SIGTERM');
    });
  } catch (error) {
    console.error('Error in development setup:', error);
  }
};

export { development };
