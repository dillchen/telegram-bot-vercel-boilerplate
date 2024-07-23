import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
});

export const generateText = async (prompt: string): Promise<string> => {
    const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
    });
    return completion.choices[0].message?.content?.trim() || '';
};

export const generateImages = async (description: string, number: number): Promise<string[]> => {
    const response = await openai.images.generate({
        prompt: description,
        n: number,
        size: '256x256',
        response_format: 'url',
    });
    return response.data.map(item => item.url || '');
};