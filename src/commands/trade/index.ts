export { setupTradeCommand, buyCommand, sellCommand } from './trade';
export { setupTradeHandlers } from './tradeHandlers';

/* DESCRIPTION:

Handles the /buy and /sell commands:

1. Sets up the trade commands (/buy and /sell) and trade handlers.
2. Initializes the trade process when a user triggers /buy or /sell.
3. Guides the user through a step-by-step process:
   a. Asks for the ticker of the token to trade.
   b. Asks for the amount of ETH to trade.
   c. Requests confirmation of the trade details.
4. Manages the trade state using session data.
5. Provides keyboard options for easy input and navigation.
6. Allows cancellation at any point in the process.
7. Executes the trade transaction (placeholder for actual implementation).
8. Provides feedback on successful trades or cancellations.

The process is managed through a state machine, transitioning between:
AWAITING_TICKER -> AWAITING_AMOUNT -> AWAITING_CONFIRMATION

*/

/* 

TODO: 

1. Currently uses dummy data for available tokens. Integration with 
actual token data and trade execution is pending implementation.
2. Add helpers (ideally via common protocol sdk to help with currency conversion and more)
3. Return a Transaction ID or Hash or something to let the user know it was successful

*/