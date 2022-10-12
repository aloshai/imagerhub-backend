export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    uri: process.env.MONGO_DSN,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },
  fileService: {
    host: process.env.FILE_SERVICE_HOST,
    port: process.env.FILE_SERVICE_PORT,
  }
});