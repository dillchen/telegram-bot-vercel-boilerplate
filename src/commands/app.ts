import { Context } from 'telegraf';
import { webAppUrl } from '../constants';

const appCommand = () => async (ctx: Context) => {
    // Check the current state of the chat menu button
    const currentMenu = await ctx.getChatMenuButton();

    // Determine if the current menu button is set to the web app or not
    const isWebApp = currentMenu && currentMenu.type === 'web_app';

    if (isWebApp) {
        // If currently a web app, switch to commands menu
        await ctx.setChatMenuButton({ type: 'commands' })
            .then(() => {
                ctx.reply('Chat menu button set to Commands');
            })
            .catch((error) => {
                ctx.reply('Failed to set chat menu button to Commands');
                console.error('Error setting chat menu button:', error);
            });
    } else {
        // If currently commands or not set, switch to web app
        const menuButton = {
            type: 'web_app' as 'web_app',
            text: 'Launch Common',
            web_app: {
                url: webAppUrl
            }
        };

        await ctx.setChatMenuButton(menuButton)
            .then(() => {
                ctx.reply('Chat menu button set to Web App');
            })
            .catch((error) => {
                ctx.reply('Failed to set chat menu button to Web App');
                console.error('Error setting chat menu button:', error);
            });
    }
};

export { appCommand };