import { Telegraf, Markup } from 'telegraf';
import { MyContext } from '../../types';
import { generateText, generateImages } from '../../openAIHelpers';
import { STATES, ACTIONS, webAppUrl } from '../../constants';
import { handleIconSelection } from './iconSelectionHandler';

export const setupLaunchHandlers = (bot: Telegraf<MyContext>) => {
    console.log('Setting up launch handlers');

    // Handle text messages
    bot.on('text', handleTextMessage);

    // Handle icon selection
    bot.action(/select_icon_(\d)/, handleIconSelection);

    // Handle Random Coin generation
    bot.action(ACTIONS.RANDOM_COIN, handleRandomCommunity);

    // Handle cancellation of community creation
    bot.action(ACTIONS.CANCEL_CREATION, async (ctx) => {
        await ctx.answerCbQuery('Community creation cancelled');
        await ctx.editMessageText('Community creation cancelled. Use /launch to start over.');
        ctx.session.state = null;
    });

    // Handle confirmation of community creation
    bot.action(ACTIONS.CONFIRM_CREATION, async (ctx) => {
        await ctx.answerCbQuery('Creating your community...');
        await ctx.editMessageText('Creating your community...');

        try {
            /* TODO: cc: @Ian 
            Simulate community creation (replace with actual creation logic)

            1. Requires Community Creation API
            2. Requires Contract Launching SDK
            3. (Maybe) Requires additional prompt or something

            https://github.com/hicommonwealth/commonwealth/issues/7780
            */ 
            await new Promise(resolve => setTimeout(resolve, 2000));
            const contractAddress = '0x' + Math.random().toString(16).substr(2, 40);
            const shareLink = `${webAppUrl}/${ctx.session.communityData.name}`;

            const successMessage = `
            Token created! Go to the app to manage your coin's community and incentives.
            Contract Address: ${contractAddress}`;


            await ctx.editMessageText(successMessage, 
                Markup.inlineKeyboard([
                    Markup.button.callback('Share Link', ACTIONS.SHARE_LINK),
                    Markup.button.url('Tap to Earn', shareLink)
                ])
            );

            ctx.session.communityData.contractAddress = contractAddress;
            ctx.session.communityData.shareLink = shareLink;
        } catch (error) {
            console.error('Error during community creation:', error);
            await ctx.editMessageText('An error occurred during the community creation process.');
        }
        ctx.session.state = null;
    });

    // Handle sharing of community link
    bot.action(ACTIONS.SHARE_LINK, async (ctx) => {
        const shareLink = ctx.session.communityData.shareLink;
        await ctx.answerCbQuery('Link copied to clipboard!', { show_alert: true });
        await ctx.reply(`Here's your share link: ${shareLink}\n(The link has been copied to your clipboard)`);
    });

    // Handle "Generate the Rest" action
    bot.action(ACTIONS.GENERATE_REST, async (ctx) => {
        await ctx.answerCbQuery('Generating the rest of your community...');
        await handleGenerateRest(ctx);
    });
};

// Handle different types of text messages based on the current state
const handleTextMessage = async (ctx: MyContext) => {
    if (!ctx.message || !('text' in ctx.message)) return;

    const state = ctx.session.state;
    const text = ctx.message.text;

    if (state === STATES.AWAITING_NAME) {
        await handleAwaitingName(ctx, text);
    } else if (state === STATES.AWAITING_DESCRIPTION) {
        await handleAwaitingDescription(ctx, text);
    } else if (state === STATES.AWAITING_ADDRESS) {
        await handleAwaitingAddress(ctx, text);
    }

    // Add buttons for "Generate the Rest" and "Cancel" after each step
    if (state !== null && state !== STATES.AWAITING_ICON_SELECTION) {
        await ctx.reply('What would you like to do next?',
            Markup.inlineKeyboard([
                Markup.button.callback('Generate the Rest', ACTIONS.GENERATE_REST),
                Markup.button.callback('Cancel', ACTIONS.CANCEL_CREATION)
            ])
        );
    }
};

// Generate a random community name, description, and icons
const handleRandomCommunity = async (ctx: MyContext) => {
    await ctx.answerCbQuery('Generating a random coin...');
    await ctx.editMessageText('Generating a random coin...');
    try {
        const name = await generateText('Generate a random coin name, should be only 2 or 3 words');
        const description = await generateText(`Generate a short description for a community called '${name}'. It should be 140 characters or less.`);
        const iconUrls = await generateImages(description, 4);

        ctx.session.communityData = {
            name,
            description,
            potentialIconUrls: iconUrls,
        };

        await ctx.editMessageText(`Generated community name: ${name}\nGenerated description: ${description}\n\nNow generating icons...`);

        await sendIconSelectionMessage(ctx, iconUrls);

        ctx.session.state = STATES.AWAITING_ICON_SELECTION;
    } catch (error) {
        console.error('Error generating random community:', error);
        await ctx.editMessageText('Sorry, there was an error generating the random community. Please try again or enter a name manually.');
    }
};

// Handle the community name input
const handleAwaitingName = async (ctx: MyContext, text: string) => {
    ctx.session.communityData = { name: text };
    await ctx.reply('Please provide a description for your community.');
    ctx.session.state = STATES.AWAITING_DESCRIPTION;
};

// Handle the community description input and generate icons
const handleAwaitingDescription = async (ctx: MyContext, text: string) => {
    ctx.session.communityData.description = text;
    await ctx.reply('Generating icons for your community...');
    
    try {
        const iconUrls = await generateImages(text, 4);
        
        if (!iconUrls || iconUrls.length === 0) {
            throw new Error('Failed to generate icon URLs');
        }
        
        ctx.session.communityData.potentialIconUrls = iconUrls;
        
        await sendIconSelectionMessage(ctx, iconUrls);
        
        ctx.session.state = STATES.AWAITING_ICON_SELECTION;
    } catch (error) {
        console.error('Error generating images:', error);
        await ctx.reply('Sorry, there was an error generating the icons. Please provide your wallet address to continue.');
        ctx.session.state = STATES.AWAITING_ADDRESS;
    }
};

// Handle the wallet address input and attempt to create the community
const handleAwaitingAddress = async (ctx: MyContext, text: string) => {
    ctx.session.communityData.address = text;
    await ctx.reply('Creating your community...');

    try {
        console.log('Community creation attempted with data:', ctx.session.communityData);
        await ctx.reply('Community creation process completed.');
    } catch (error) {
        console.error('Error during community creation:', error);
        await ctx.reply('An error occurred during the community creation process.');
    }
    ctx.session.state = null;
};

// Send a message with icon options for selection
const sendIconSelectionMessage = async (ctx: MyContext, iconUrls: string[]) => {
    await ctx.replyWithMediaGroup(iconUrls.map((url: string, index: number) => ({
        type: 'photo',
        media: url,
        caption: `Option ${index + 1}`
    })));

    await ctx.reply('Please select an icon for your community:', 
        Markup.inlineKeyboard([
            ...iconUrls.map((_, index) => 
                Markup.button.callback(`V${index + 1}`, `select_icon_${index}`)
            ),
            Markup.button.callback('Cancel', ACTIONS.CANCEL_CREATION)
        ])
    );
    console.log('Inline keyboard sent with Cancel and Generate Rest buttons');
};

const handleGenerateRest = async (ctx: MyContext) => {
    const state = ctx.session.state;
    
    if (state === STATES.AWAITING_DESCRIPTION) {
        const description = await generateText(`Generate a short description for a community called '${ctx.session.communityData.name}'`);
        ctx.session.communityData.description = description;
        await ctx.reply(`Generated description: ${description}`);
    }
    
    if (state === STATES.AWAITING_DESCRIPTION || state === STATES.AWAITING_ICON_SELECTION) {
        await ctx.reply('Generating icons for your community...');
        const description = ctx.session.communityData.description || ctx.session.communityData.name || 'community';
        const iconUrls = await generateImages(description, 4);
        ctx.session.communityData.potentialIconUrls = iconUrls;
        await sendIconSelectionMessage(ctx, iconUrls);
    }
    
    ctx.session.state = STATES.AWAITING_ICON_SELECTION;
};