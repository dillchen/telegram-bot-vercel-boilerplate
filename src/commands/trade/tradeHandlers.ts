import { Telegraf, Markup } from 'telegraf';
import { MyContext } from '../../types';
import { STATES, ACTIONS } from '../../utils/constants';

// TODO: Replace with actual API call
const getDummyTokens = () => ['RECENT1', 'RECENT2', 'NEW1', 'NEW2', 'TOP1', 'TOP2'];

export const setupTradeHandlers = (bot: Telegraf<MyContext>) => {
  console.log('Setting up trade handlers');

  bot.on('text', async (ctx, next) => {
    console.log('Received text message:', ctx.message.text);
    console.log('Current session state:', ctx.session.state);

    if (!ctx.session.state || !ctx.session.state.startsWith('AWAITING_')) {
      console.log('No valid state, passing to next middleware');
      return next();
    }

    if (ctx.message.text === 'Cancel') {
      await ctx.reply('Trade operation cancelled.');
      ctx.session.state = null;
      console.log('Trade cancelled, state reset');
      return;
    }

    switch (ctx.session.state) {
      case STATES.AWAITING_TICKER:
        console.log('Processing AWAITING_TICKER state');
        ctx.session.tradeData.ticker = ctx.message.text;
        ctx.session.state = STATES.AWAITING_AMOUNT;
        await ctx.reply(
          `Choose an amount or type how much ${ctx.session.tradeData.ticker} you want to ${ctx.session.tradeData.action}:`,
          Markup.keyboard([
            ['1 ETH', '0.1 ETH'],
            [`500 ${ctx.session.tradeData.ticker}`, `1000 ${ctx.session.tradeData.ticker}`],
            ['Cancel']
          ])
            .oneTime()
            .resize()
        );
        console.log('Updated state to AWAITING_AMOUNT');
        break;

      case STATES.AWAITING_AMOUNT:
        let amount: number;
        const input = ctx.message.text;

        if (input.endsWith('ETH')) {
          amount = parseFloat(input.split(' ')[0]);
          ctx.session.tradeData.unit = 'ETH';
        } else if (input.includes(ctx.session.tradeData.ticker)) {
          amount = parseFloat(input.split(' ')[0]);
          ctx.session.tradeData.unit = ctx.session.tradeData.ticker;
        } else {
          amount = parseFloat(input);
          ctx.session.tradeData.unit = ctx.session.tradeData.ticker;
        }

        if (isNaN(amount) || amount <= 0) {
          await ctx.reply('Please enter a valid amount.');
          return;
        }

        ctx.session.tradeData.amount = amount;
        ctx.session.state = STATES.AWAITING_CONFIRMATION;
        await ctx.reply(
          `You want to ${ctx.session.tradeData.action} ${ctx.session.tradeData.amount} ${ctx.session.tradeData.unit} ${ctx.session.tradeData.unit === 'ETH' ? `worth of ${ctx.session.tradeData.ticker}` : ''}. Please confirm.`,
          Markup.inlineKeyboard([
            Markup.button.callback('Confirm', ACTIONS.CONFIRM_TRADE),
            Markup.button.callback('Cancel', ACTIONS.CANCEL_TRADE)
          ])
        );
        break;

      default:
        console.log('Unhandled state:', ctx.session.state);
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