import { Context } from 'telegraf';

/* DESCRIPTION:

Informs the user that they can add this to a group chat

*/

const createClub = () => async (ctx: Context) => {
  const message = `*Use Common Bot in a group chat

1. Add Common Coin Bot to your group
2. Grant the bot admin permissions

Every chat with Common Bot gets 1) more airdrops, 2) creates coins, and 3) lets chats manage quests and rewards

Need help? Contact our support team.`;

  console.log(`Triggered "createClub" command`);
  try {
    await ctx.replyWithMarkdownV2(message, { parse_mode: 'MarkdownV2' });
  } catch (error: unknown) {
    console.error('Error in createClub command:', error);
    await ctx.reply('Sorry, there was an error. Please try again later.');
  }
};

export { createClub };