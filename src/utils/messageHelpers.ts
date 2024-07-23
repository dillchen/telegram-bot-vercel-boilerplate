import { MyContext } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export const sendLoadingMessage = async (ctx: MyContext, text: string) => {
    const imagePath = path.join(__dirname, '..', '..', 'static', 'loading.gif');
    
    return await ctx.replyWithAnimation(
        { source: fs.createReadStream(imagePath) },
        {
            caption: text,
        }
    );
};