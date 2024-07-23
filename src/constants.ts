export const STATES = {
    AWAITING_NAME: 'awaiting_name',
    AWAITING_DESCRIPTION: 'awaiting_description',
    AWAITING_ICON_SELECTION: 'awaiting_icon_selection',
    AWAITING_ADDRESS: 'awaiting_address',
};

export const ACTIONS = {
    CANCEL_CREATION: 'cancel_creation',
    CONFIRM_CREATION: 'confirm_creation',
    SHARE_LINK: 'share_link',
};

export const webAppUrl = process.env.NODE_ENV === 'production' 
    ? 'https://commonwealth.im' 
    : process.env.LOCAL_URL || 'https://commonwealth.im';