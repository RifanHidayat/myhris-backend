import { registerAs } from '@nestjs/config';

export default registerAs('sftp', () => ({
  host: process.env.SFTP_HOST,
  port: parseInt(process.env.SFTP_PORT || '22', 10),
  username: process.env.SFTP_USERNAME,
  password: process.env.SFTP_PASSWORD,
  privateKeyPath: process.env.SFTP_PRIVATE_KEY_PATH || null,
}));
