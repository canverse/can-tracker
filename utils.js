import assertEnv from 'assert-env';

export function checkEnvironmentVariables() {
  try {
    assertEnv([
        'CAN_TRACKER_ANNOUNCE_URL',
        'CAN_TRACKER_PATH',
        'CAN_TRACKER_PORT',
    ]);
  } catch (err) {
    console.error('You need to set the following environment variables for CanTracker to work');
    console.error('CAN_TRACKER_ANNOUNCE_URL', 'CAN_TRACKER_PATH', 'CAN_TRACKER_PORT');
    console.log(process.env);
    process.exit(1);
  }
}
