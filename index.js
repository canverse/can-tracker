import { startServer } from './tracker.js';
import bootstrap from './bootstrap.js';

bootstrap().then(() => {
  startServer();
});

