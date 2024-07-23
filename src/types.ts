import { Context } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';

interface SessionData {
    state: string | null;
    communityData: CommunityData;
}

export interface MyContext extends Context {
    session: SessionData;
}

export interface CommunityData {
    name?: string;
    description?: string;
    potential_icon_urls?: string[];
    selected_icon_url?: string;
    address?: string;
}