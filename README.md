# Trivia.AI

Trivia.AI is a browser game that allows multiple players to compete with each other by answering trivia questions within limited time. The questions are generated using AI technology so you can have unlimited number of questions about any topic.

## How to play

### Prerequisites

1. Questions are generated using [ChatGPT](https://chat.openai.com) so you need to have an OpenAI account first (or use [AzureOpenAI Service](https://azure.microsoft.com/products/ai-services/openai-service))
2. Players need to login using GitHub account so you need to create a [GitHub OAuth App](https://docs.github.com/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)
3. [Node.js](https://nodejs.org)

### Build and run

1. Set configurations as environment variables:
   ```
   export OPENAI_API_KEY=<your_openai_api_key>
   export GITHUB_CLIENT_ID=<your_github_app_client_id>
   export GITHUB_CLIENT_SECRET=<your_github_app_client_secret>
   ```

   If you're using Azure OpenAI service, use the following instead of `OPENAI_API_KEY`:

   ```
   export AZURE_OPENAI_RESOURCE_NAME=<your_azure_openai_resource_name>
   export AZURE_OPENAI_DEPLOYMENT_NAME=<your_azure_openai_deployment_name>
   export AZURE_OPENAI_API_KEY=<your_azure_openai_api_key>
   ```

   You can also put the configurations in `.env` file.

2. Run the following command to build and run the app:

   ```
   npm install
   npm run build
   npm start
   ```

Now open `http://localhost:3000` in your browser, login with your GitHub account and type any topic you like, then enjoy the game generated by AI.

## Using bots

If you want to play it alone, there is also a bot script that can generate some bots to play together with you to make the game more fun. To use the bot:

```
npm run bot
```

It will automatically connect 10 bots to the server.

You can also configure bot behavior using following options:

```
npm run bot <strength> <speed> <count> <endpoint>
```

1. `strength`: the "cleverness" (from 1 to 10, default is 6) of the bot. Higher value means higher correctness rate when answering questions.
2. `speed`: the speed (from 1 to 10, default is 6) of bot when answering questions. Higher value means bot will answer questions in shorter time (which leads to higher score if the answer is correct).
3. `count`: number of bots to generate (default is 10)
4. `endpoint`: endpoint of server (default is http://localhost:3000). If your server is running on a different machine (e.g. deployed to cloud), use this option to specify the address.

There is also a simple auth mechanism to ensure bot cannot connect anonymously. Simply set this configuration (on both server and bot) if you need bot to be authenticated:

```
export LOGIN_SECRET=<your_login_secret>
```