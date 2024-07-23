import { Telegraf, Markup } from 'telegraf';
import { MyContext, CommunityData } from '../types';

import axios from 'axios';
import { OpenAI } from 'openai';
// import useQuickCreateCommunity from 'path/to/useQuickCreateCommunity';

/* 

DONE:

1. Add a Random Button, allows user to generate short name, description, and image

TODO:

2. at end of completion with image, description, and name, 
   should return a button allowing the user to create the community
3. add a little loading gif while 1) image is being generated and 2) community is being created 3) and random community is being generated

*/

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
});

export const launchCommand = async (ctx: MyContext) => {
    if (!ctx.session) {
        ctx.session = { state: null, communityData: {} };
    }

    await ctx.reply(
        'Launch a community! Type your idea',
        Markup.keyboard([['Random']])
            .oneTime()
            .resize()
    );
    ctx.session.state = 'awaiting_name';
};

export const setupLaunchHandlers = (bot: Telegraf<MyContext>) => {
    console.log('Setting up launch handlers');

    bot.command('launch', launchCommand);
  
    bot.on('text', async (ctx: MyContext) => {
        if (!ctx.message || !('text' in ctx.message)) return; // Ensure we're dealing with a defined text message

        const state = ctx.session.state;
        const text = ctx.message.text;
  
        if (text === 'Generate Random Community') {
            await ctx.reply('Generating a random community...');
            try {
                const name = await generateText('Generate a random community name, should be only 2 or 3 words');
                const description = await generateText(`Generate a short description for a community called '${name}'`);
                const iconUrls = await generateImages(description, 4);
    
                ctx.session.communityData = {
                    name,
                    description,
                    potential_icon_urls: iconUrls,
                };
    
                await ctx.reply(`Generated community name: ${name}`);
                await ctx.reply(`Generated description: ${description}, now generating icons...`);
    
                // Send the images as a media group with buttons for selection
                await ctx.replyWithMediaGroup(iconUrls.map((url: string, index: number) => ({
                    type: 'photo',
                    media: url,
                    caption: `Option ${index + 1}`
                })));
    
                await ctx.reply('Please select an icon for your community:', 
                    Markup.inlineKeyboard(
                        iconUrls.map((_, index) => 
                            Markup.button.callback(`Option ${index + 1}`, `select_icon_${index}`)
                        )
                    )
                );
                console.log('Inline keyboard sent');
    
                ctx.session.state = 'awaiting_icon_selection';
            } catch (error) {
                console.error('Error generating random community:', error);
                await ctx.reply('Sorry, there was an error generating the random community. Please try again or enter a name manually.');
            }
        } else if (state === 'awaiting_name') {
            ctx.session.communityData = { name: text };
            await ctx.reply('Please provide a description for your community.');
            ctx.session.state = 'awaiting_description';
        } else if (state === 'awaiting_description') {
            ctx.session.communityData.description = text;
            await ctx.reply('Generating icons for your community...');
            
            try {
                const iconUrls = await generateImages(text, 4);
                
                if (!iconUrls || iconUrls.length === 0) {
                    throw new Error('Failed to generate icon URLs');
                }
                
                ctx.session.communityData.potential_icon_urls = iconUrls;
                
                // Send the images as a media group with buttons for selection
                await ctx.replyWithMediaGroup(iconUrls.map((url: string, index: number) => ({
                    type: 'photo',
                    media: url,
                    caption: `Option ${index + 1}`
                })));

                await ctx.reply('Please select an icon for your community:', 
                    Markup.inlineKeyboard(
                        iconUrls.map((_, index) => 
                            Markup.button.callback(`Option ${index + 1}`, `select_icon_${index}`)
                        )
                    )
                );
                console.log('Inline keyboard sent');
                
                ctx.session.state = 'awaiting_icon_selection';
            } catch (error) {
                console.error('Error generating images:', error);
                await ctx.reply('Sorry, there was an error generating the icons. Please provide your wallet address to continue.');
                ctx.session.state = 'awaiting_address';
            }
        } else if (state === 'awaiting_address') {
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
        }
    });

    bot.action(/select_icon_(\d)/, async (ctx) => {
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
    
            const potentialUrls = ctx.session.communityData.potential_icon_urls;
            console.log('Potential URLs:', potentialUrls);
    
            if (potentialUrls && Array.isArray(potentialUrls) && selectedIndex < potentialUrls.length) {
                const selectedUrl = potentialUrls[selectedIndex];
                ctx.session.communityData.selected_icon_url = selectedUrl;
                ctx.session.state = 'awaiting_address';
                
                await ctx.answerCbQuery('Icon selected successfully');
                await ctx.editMessageText('Great choice! Now, please provide your wallet address to continue.');
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
    });    

    // Add a catch-all action handler for debugging
    bot.action(/.+/, (ctx) => {
        console.log('Catch-all action triggered');
        console.log('Action data:', (ctx.callbackQuery as any)?.data);
        return ctx.answerCbQuery();
    });
};

// ... rest of the file remains unchanged ...

const generateText = async (name: string) => {
    const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
            {
                role: 'user',
                content: `Generate a short, compelling description for a community called '${name}'. Keep it concise and engaging.`,
            },
        ],
    });
    return completion.choices[0].message?.content?.trim() || '';
};
  
const generateImages = async (description: string, number: number) => {
    try {
        const response = await openai.images.generate({
            prompt: description,
            n: number,
            size: '256x256',
            response_format: 'url',
        });
        return response.data.map(item => item.url || '');
    } catch (e) {
        console.error(e);
        throw new Error('Problem Generating Image!');
    }
};