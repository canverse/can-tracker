import { createAndInitDatabase } from './databaseOperations.js';

import { checkEnvironmentVariables } from './utils';

checkEnvironmentVariables();

export default function bootstrap(tasks=[]) {
  return Promise.all([
      createAndInitDatabase(),
      ...tasks,
  ]);
};

