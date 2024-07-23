import { Telegraf, Markup } from 'telegraf';
import { MyContext, CommunityData } from '../../types';
import { setupLaunchHandlers } from './launchHandlers';
import { STATES, ACTIONS } from '../../constants';

export const launchCommand = async (ctx: MyContext) => {
    if (!ctx.session) {
        ctx.session = { state: null, communityData: {} };
    }

    await ctx.reply(
        'Launch a community! Type your idea',
        Markup.keyboard([['Random Community']])
            .oneTime()
            .resize()
    );
    ctx.session.state = STATES.AWAITING_NAME;
};

export const setupLaunchCommand = (bot: Telegraf<MyContext>) => {
    console.log('Setting up launch command');
    bot.command('launch', launchCommand);
    setupLaunchHandlers(bot);
};