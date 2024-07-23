import { launchCommand, setupLaunchCommand } from './launchCommand';
import { setupLaunchHandlers } from './launchHandlers';

export { launchCommand, setupLaunchHandlers, setupLaunchCommand };

/* 

DONE:

1. Add a Random Button, allows user to generate short name, description, and image
2. at end of completion with image, description, and name, 
   should return a button allowing the user to create the community
3. Add Button to Cancel through the flow and Generate Remaning for Me
4. add a little loading gif while 1) image is being generated and 2) community is being created 3) and random community is being generated
5. Clean Up the messsages after each step

MAYBE: 
1. Message formatting, should be cleaned up
2. Get rid of images after making selection
3. Loading image / GIF
4. Clean up and actually trigger app launch in community

*/