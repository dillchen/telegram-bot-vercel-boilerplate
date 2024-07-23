import { Telegraf, Markup } from 'telegraf';
import { MyContext } from '../../types';
import { STATES } from '../../utils/constants';
import { setupTradeHandlers } from './tradeHandlers';

// TODO: Replace with actual API call
const getDummyTokens = () => ['RECENT1', 'RECENT2', 'NEW1', 'NEW2', 'TOP1', 'TOP2'];

export const setupTradeCommand = (bot: Telegraf<MyContext>) => {
    console.log('Setting up trade commands');
    bot.command('buy', buyCommand);
    bot.command('sell', sellCommand);
    setupTradeHandlers(bot);
  };

export const buyCommand = async (ctx: MyContext) => {
  await tradeCommand(ctx, 'buy');
};

export const sellCommand = async (ctx: MyContext) => {
  await tradeCommand(ctx, 'sell');
};

const tradeCommand = async (ctx: MyContext, action: 'buy' | 'sell') => {
  console.log(`${action} command triggered`);
  console.log('Current session state:', ctx.session.state);
  ctx.session.state = STATES.AWAITING_TICKER;
  console.log('Updated session state:', ctx.session.state);
  ctx.session.tradeData = { ticker: '', amount: 0, action, unit: 'ETH' };
  console.log('Trade data set:', ctx.session.tradeData);
  const tokens = getDummyTokens();
  console.log('Tokens retrieved:', tokens);
  try {
    await ctx.reply(`Please enter the $TICKER of the token you want to ${action}.`,
      Markup.keyboard([tokens.slice(0, 3), tokens.slice(3)])
        .oneTime()
        .resize()
    );
    console.log('Reply sent successfully');
  } catch (error) {
    console.error('Error sending reply:', error);
  }
};