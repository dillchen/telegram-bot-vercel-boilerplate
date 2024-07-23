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
            
            // Remove unselected images
            ctx.session.communityData.potentialIconUrls = [selectedUrl];

            const confirmationMessage = `
            **Coin Details:**
            **Ticker:** ${ctx.session.communityData.name}
            **Description:** ${ctx.session.communityData.description}

            Are you ready to create this coin?`;
            
            await ctx.editMessageText(confirmationMessage, 
                Markup.inlineKeyboard([
                    Markup.button.callback('Cancel', ACTIONS.CANCEL_CREATION),
                    Markup.button.callback('Send it', ACTIONS.CONFIRM_CREATION)
                ])
            );

            // Delete the messages with unselected images
            if (ctx.chat && ctx.session.iconMessageIds) {
                console.log('Attempting to delete unselected images');
                console.log('Icon message IDs:', ctx.session.iconMessageIds);
                for (let i = 0; i < ctx.session.iconMessageIds.length; i++) {
                    if (i !== selectedIndex) {
                        try {
                            await ctx.telegram.deleteMessage(ctx.chat.id, ctx.session.iconMessageIds[i]);
                            console.log(`Successfully deleted message with ID: ${ctx.session.iconMessageIds[i]}`);
                        } catch (deleteError) {
                            console.error(`Failed to delete message with ID: ${ctx.session.iconMessageIds[i]}`, deleteError);
                        }
                    }
                }
                ctx.session.iconMessageIds = [ctx.session.iconMessageIds[selectedIndex]];
                console.log('Updated icon message IDs:', ctx.session.iconMessageIds);
            } else {
                console.log('Chat or iconMessageIds not available for deletion');
            }
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