export const STATES = {
    // States for /launch
    LAUNCH_AWAITING_NAME: 'LAUNCH_AWAITING_NAME',
    LAUNCH_AWAITING_DESCRIPTION: 'LAUNCH_AWAITING_DESCRIPTION',
    LAUNCH_AWAITING_ICON_SELECTION: 'LAUNCH_AWAITING_ICON_SELECTION',
    LAUNCH_AWAITING_ADDRESS: 'LAUNCH_AWAITING_ADDRESS',
    
    // States for /buy and /sell in trade.ts command
    AWAITING_TICKER: 'AWAITING_TICKER',
    AWAITING_AMOUNT: 'AWAITING_AMOUNT',
    AWAITING_CONFIRMATION: 'AWAITING_CONFIRMATION',
};

export const ACTIONS = {
    CANCEL_CREATION: 'cancel_creation',
    CONFIRM_CREATION: 'confirm_creation',
    SHARE_LINK: 'share_link',
    // New actions for trade flow
    CONFIRM_TRADE: 'confirm_trade',
    CANCEL_TRADE: 'cancel_trade',
    GENERATE_REST: 'generate_rest',
    RANDOM_COIN: 'random_coin', // Add this new action
};

export const webAppUrl = process.env.NODE_ENV === 'production' 
    ? 'https://commonwealth.im' 
    : process.env.LOCAL_URL || 'https://commonwealth.im';