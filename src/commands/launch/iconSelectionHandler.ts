import { MyContext } from '../../types';
import { Markup } from 'telegraf';
import { ACTIONS } from '../../constants';

export const handleIconSelection = async (ctx: MyContext & { match: RegExpExecArray }) => {
    console.log('Icon selection action triggered');
    try {
        const match = ctx.match[1];
        console.log('Matched index:', match);
        const selectedIndex = parseInt(match, 10);
        console.log('Selected index:', selectedIndex);

        if (!ctx.session || !ctx.session.communityData) {
            console.error('Session or communityData is undefined');
            await ctx.answerCbQuery('Session error');
            return await ctx.reply('There was an error with your session. Please start over.');
        }

        const potentialUrls = ctx.session.communityData.potentialIconUrls;
        console.log('Potential URLs:', potentialUrls);

        if (potentialUrls && Array.isArray(potentialUrls) && selectedIndex < potentialUrls.length) {
            const selectedUrl = potentialUrls[selectedIndex];
            ctx.session.communityData.selectedIconUrl = selectedUrl;
            
            const confirmationMessage = `
            Community Details:
            Name: ${ctx.session.communityData.name}
            Description: ${ctx.session.communityData.description}
            Selected Icon: Option ${selectedIndex + 1}

            Are you ready to create this community?`;
            
            await ctx.editMessageText(confirmationMessage, 
                Markup.inlineKeyboard([
                    Markup.button.callback('Cancel', ACTIONS.CANCEL_CREATION),
                    Markup.button.callback('Send it', ACTIONS.CONFIRM_CREATION)
                ])
            );
        } else {
            console.error('Invalid selection or potentialUrls not found');
            await ctx.answerCbQuery('Invalid selection');
            await ctx.editMessageText('There was an error with your selection. Please try again.');
        }
    } catch (error) {
        console.error('Error in icon selection:', error);
        await ctx.answerCbQuery('An error occurred');
        await ctx.reply('An unexpected error occurred. Please try again.');
    }
};