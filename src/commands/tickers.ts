import axios from 'axios';
import { Context } from 'telegraf';

export const tickerCommand = async (ctx: Context) => {
  try {
    const response = await axios.get('https://commonwealth.im/api/communities?snapshots=true', {
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    // Log the entire response data to understand its structure
    console.log('API Response Data:', response.data);

    // Check if the result property exists and has the expected format
    if (!response.data || !Array.isArray(response.data.result)) {
    console.error('Unexpected response structure:', response.data);
    await ctx.reply('Failed to fetch ticker data due to unexpected response structure. Please check the logs.');
    return;
    }

    // Extract the first 5 communities from the result array
    const communities = response.data.result.slice(0, 5);
    const message = communities.map((item: any, index: number) => {
        const communityName = item.community ? item.community.name : 'Unnamed Community';
        const communityId = item.community ? item.community.id : 'unknown';
        return `${index + 1}. [${communityName}](https://commonwealth.im/${communityId})`;
      }).join('\n');
    await ctx.reply(message, { parse_mode: 'Markdown' });

    } catch (error) {
    console.error('Failed to fetch ticker data:', error);
    await ctx.reply('Failed to fetch ticker data. Please try again later.');
    }
};