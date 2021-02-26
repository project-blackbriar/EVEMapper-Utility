# EVEMapper-Utility
This utility preloads the database with solar systems and wormhole satics. It is necessary for the fuctioning of [Artemis Mapper for EVE Online](https://github.com/project-blackbriar/EVEMapper).

## .env
Copy `dotenv-example` file to `.env` and edit to fill in your ESI app ID and Secret Key. `DBUrl` default is configured for a local development environment. Change `DBUrl` to use your credentials if needed.

```
cp dotenv-example .env
nano .env
```

## Run
Run the Utility to load solar systems into the database.
```
node main.js systems
```
Watch the console output.

You'll see the status of every system. Because we're trying to do this quickly and ESI is quite unstable, some systems might have `Errored` next to them. If that is the case, run the command again and verify all systems are updated or skipped.

Next, we need to update all wormhole systems to include a list of their respective static connections.
```
node main.js statics
```
Wait for this to complete. Assuming there were no errors, you're done!
