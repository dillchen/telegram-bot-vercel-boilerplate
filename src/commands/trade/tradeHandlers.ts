import { Telegraf, Markup } from 'telegraf';
import { MyContext } from '../../types';
import { STATES, ACTIONS } from '../../utils/constants';

// TODO: Replace with actual API call
const getDummyTokens = () => ['RECENT1', 'RECENT2', 'NEW1', 'NEW2', 'TOP1', 'TOP2'];

export const setupTradeHandlers = (bot: Telegraf<MyContext>) => {
  console.log('Setting up trade handlers');

  bot.on('text', async (ctx, next) => {
    if (!ctx.session.state || !ctx.session.state.startsWith('AWAITING_')) {
      return next();
    }

    if (ctx.message.text === 'Cancel') {
      await ctx.reply('Trade operation cancelled.');
      ctx.session.state = null;
      return;
    }

    switch (ctx.session.state) {
      case STATES.AWAITING_TICKER:
        ctx.session.tradeData.ticker = ctx.message.text;
        ctx.session.state = STATES.AWAITING_AMOUNT;
        await ctx.reply(
          `You've selected $${ctx.session.tradeData.ticker}. How much ETH do you want to ${ctx.session.tradeData.action}?`,
          Markup.keyboard([['Cancel']])
            .oneTime()
            .resize()
        );
        break;

      case STATES.AWAITING_AMOUNT:
        const amount = parseFloat(ctx.message.text);
        if (isNaN(amount) || amount <= 0) {
          await ctx.reply('Please enter a valid amount.');
          return;
        }
        // TODO: Check if user has enough ETH in their wallet for buying
        // TODO: Check if user has enough tokens for selling
        ctx.session.tradeData.amount = amount;
        ctx.session.state = STATES.AWAITING_CONFIRMATION;
        await ctx.reply(
          `You want to ${ctx.session.tradeData.action} $${ctx.session.tradeData.ticker} with ${ctx.session.tradeData.amount} ETH. Please confirm.`,
          Markup.inlineKeyboard([
            Markup.button.callback('Confirm', ACTIONS.CONFIRM_TRADE),
            Markup.button.callback('Cancel', ACTIONS.CANCEL_TRADE)
          ])
        );
        break;

      default:
        return next();
    }
  });

  bot.action(ACTIONS.CONFIRM_TRADE, async (ctx) => {
    // TODO: Execute the trade transaction
    await ctx.answerCbQuery();
    await ctx.reply(`Transaction executed successfully! You ${ctx.session.tradeData.action === 'buy' ? 'bought' : 'sold'} $${ctx.session.tradeData.ticker}.`);
    ctx.session.state = null;
  });

  bot.action(ACTIONS.CANCEL_TRADE, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply('Transaction cancelled.');
    ctx.session.state = null;
  });
};