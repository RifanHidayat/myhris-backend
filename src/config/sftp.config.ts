export default () => ({
  sftp: {
    host: process.env.SFTP_HOST,
    port: parseInt(process.env.SFTP_PORT, 10) || 22,
    username: process.env.SFTP_USERNAME,
    password: process.env.SFTP_PASSWORD,
    privateKeyPath: process.env.SFTP_PRIVATE_KEY_PATH || null,
  },
});
