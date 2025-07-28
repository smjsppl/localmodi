{
    "scripts": {
      "start": "node server.js",
      "server": "nodemon server.js",
      "client": "npm start --prefix ../admin",
      "dev": "concurrently \"npm run server\" \"npm run client\""
    }
  }