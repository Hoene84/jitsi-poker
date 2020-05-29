# Jitsi Poker

This is a standalone fork of https://github.com/jitsi with periodic downstream and upstream where it makes sense.

To see changes made for this project, see https://github.com/Hoene84/jitsi-poker/pull/4

# Idea

This project allows you to play a game of Texas Hold'em with your friends in a video conference, just like you would at home.

# Current State

The Game is not yet playable, there are still some key features missing.

If you like to fiddle around with the current state, visit: https://hoene84.github.io/jitsi-poker/
* start a conference
* join and start the game with the poker cards button in the toolbar

# Architecture

This is a pure frontend project. It uses the backend of jitsi, currently alpha.jitsi.net. 
That's why i am able to deploy it on a regular github pages instance.
Regarding to the architecture of jitsi, the scope corresponds to the docker image 'jitsi-meet-web'.

All State is hold on client and shared with all conference participants using the json-message feature of jitsi.
There is no Server knowing anything about the poker feature, he just connects the clients. 

## Security

### Unprotected
All visible actions are not protected form cheating. This means everyone can modify the game state as he like (if he has some development experiance).
Just like at home, where is no protection that someone grabs the pot of another winner.

This is insecure by design and also allows "corrections" to be made to the given game sequence if the participants so wish.

### Protected
Invisible cheating attempts, such as spying on the cards of others, are prevented. This has not yet been implemented, but is conceptually prepared.

# Development
see the documentation of the forked project: https://github.com/jitsi/jitsi-meet

## Deployment to Github Pages
to deploy your local code to a github pages instance:
* set your github pages url in packages.json: `"homepage": "http://[YourUsername].github.io/jitsi-poker",`
* run `npm run deploy` in the root directory
