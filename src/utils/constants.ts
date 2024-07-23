export const STATES = {
    // States for /launch
    AWAITING_NAME: 'awaiting_name',
    AWAITING_DESCRIPTION: 'awaiting_description',
    AWAITING_ICON_SELECTION: 'awaiting_icon_selection',
    AWAITING_ADDRESS: 'awaiting_address',
    
    // States for /buy and /sell in trade.ts command
    AWAITING_TICKER: 'awaiting_ticker',
    AWAITING_AMOUNT: 'awaiting_amount',
    AWAITING_CONFIRMATION: 'awaiting_confirmation',
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