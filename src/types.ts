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
    potentialIconUrls?: string[];
    selectedIconUrl?: string;
    address?: string;
    shareLink?: string;
    contractAddress?: string;
}