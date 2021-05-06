# AMPA PWA (ampa-pwa)

PWA de gestió del AMPA

## Set environmental variables

Copy or rename `.env.example` file to `.env`, and `functions-config.json.example` to `unctions-config.json`, and fill the variables.

## Prerequisits to be able to deploy to firebase

```bash
npm install -g firebase-tools
firebase login
```

## Install the dependencies

```bash
cd functions && yarn && cd .. && yarn
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
yarn dev
```

Open another terminal and run the functions in dev mode:

```bash
yarn dev:functions
```

### Lint the files

```bash
yarn run lint
```

### Build the app for production

```bash
yarn build
```

If you want to deploy to firebase you can directly run

```bash
yarn deploy
```

### Issues

If your firebase functions have permission issues (403 error):

- Go to Google Cloud Console: <https://console.cloud.google.com/functions/?_ga=2.195777388.1777097001.1617712962-377022807.1597671974>
- Click the checkbox next to the function on which you want to grant access.
- Click Show Info Panel in the top right corner to show the Permissions tab.
- Click Add member.
- In the New members field, type `allUsers`.
- Select the role Cloud Functions > Cloud Functions Invoker from the Select a role drop-down menu.
- Click Save.
