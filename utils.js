import assertEnv from 'assert-env';

export function checkEnvironmentVariables() {
  try {
    assertEnv([
        'CAN_TRACKER_ANNOUNCE_URL',
        'CAN_TRACKER_PATH',
        'CAN_TRACKER_PORT',
        'CAN_TRACKER_WEB_SEED_URL'
    ]);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}