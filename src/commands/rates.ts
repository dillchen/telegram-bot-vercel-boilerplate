import { Context, Markup, Telegraf } from 'telegraf';
import axios from 'axios';

interface CallbackQueryWithData extends Context {
    data: string;
  }

export const coinRateCommand = async (ctx: Context) => {
  const coinPairs = ['ETH-USD', 'BTC-USD', 'ETH-BTC'];
  await ctx.reply('Select a coin pair:', Markup.inlineKeyboard(
    coinPairs.map(pair => Markup.button.callback(pair, `FETCH_${pair}`))
  ));
};

export const setupCoinRateHandlers = (bot: Telegraf) => {
  bot.action(/^FETCH_/, async (ctx) => {
    try {
      const callbackQuery = ctx.callbackQuery as unknown as CallbackQueryWithData;
      const coinPair = callbackQuery.data.split('_')[1];
      const url = `https://api.coinbase.com/v2/prices/${coinPair}/sell`;
      console.log(`Fetching data from URL: ${url}`); // Debug log

      const response = await axios.get(url);
      console.log('API Response:', response.data); // Debug log

      const rate = response.data.data.amount;
      const base = response.data.data.base;
      const currency = response.data.data.currency;
      await ctx.reply(`The current rate for ${base} to ${currency} is ${rate} ${currency}.`);
      await ctx.answerCbQuery();
    } catch (error) {
      console.error('Failed to fetch coin rate:', error);
      await ctx.reply('Failed to fetch coin rate. Please try again later.');
      await ctx.answerCbQuery();
    }
  });
};