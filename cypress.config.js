const { defineConfig } = require("cypress");

module.exports = defineConfig({
  viewportHeight: 1080,
  viewportWidth: 1920,
  video: false,
  reporter: "cypress-multi-reporters",
  reporterOptions: {
    configFile: "reporter-config.json"
  },
  env: {
    //username: 'fefe@cytest.com',
    //password: 'admin123',
    apiUrl: 'https://api.realworld.io',
    mainUrl: 'https://conduit-api.bondaracademy.com'
  },
  retries: {
    runMode: 2, //(command: npx cypress run ...) On the real test run it could  be repeated in case of glitches. 
    openMode: 0 //(command: npx cypress open ...)On debugging it should not repeat since we are testing the script itself!
  },
  e2e: {
    baseUrl: 'https://conduit.bondaracademy.com',
    specPattern: 'cypress/e2e/**/*.spec.{js,jsx,ts,tsx}',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      
      //Use the following credentials with command:
      //DB_USERNAME="fefe@cytest.com" PASSWORD="admin123" npm run cy:process
      const username = process.env.DB_USERNAME
      const password = process.env.PASSWORD
      //if(!password){
      //  throw new Error(`missing PASSWORD environment variable`)
      //}

      config.env = {username, password}
      return config
    }
  },

});
