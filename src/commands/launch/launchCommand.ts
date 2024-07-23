import { Telegraf, Markup } from 'telegraf';
import { MyContext, CommunityData } from '../../types';
import { setupLaunchHandlers } from './launchHandlers';
import { STATES, ACTIONS } from '../../constants';

export const launchCommand = async (ctx: MyContext) => {
    if (!ctx.session) {
        ctx.session = {
            state: null,
            communityData: {},
            tradeData: { ticker: '', amount: 0, action: 'buy' }
        };
    }
    const message = await ctx.reply(
        'Launch a coin! Type your idea or choose "Random Coin". You can cancel the process at any time.',
        Markup.inlineKeyboard([
            Markup.button.callback('Random Coin', ACTIONS.RANDOM_COIN),
            Markup.button.callback('Cancel', ACTIONS.CANCEL_CREATION)
        ])
    );
    ctx.session.state = STATES.AWAITING_NAME;
    ctx.session.launchMessageId = message.message_id;
};

export const setupLaunchCommand = (bot: Telegraf<MyContext>) => {
    console.log('Setting up launch command');
    bot.command('launch', launchCommand);
    setupLaunchHandlers(bot);
};