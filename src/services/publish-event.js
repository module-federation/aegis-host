import log from '../lib/logger';

export default async (event) => {
  try {
    const publishEvent = (await import('orderService/publish-event')).default;
    publishEvent(event);
  } catch (error) {
    log(error);
  }
}