import app from './app';
import { AppDataSource } from './config/data-source';
import http from 'http';
import { initSocket } from './socket';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

initSocket(server);

AppDataSource.initialize()
  .then(() => {
    console.log('Connected to DB');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => console.error('DB Connection Failed:', error));
