import log from "../lib/logger";

export default async (event) => {
  try {
    const publishEvent = (await import("orderService/services")).publishEvent;
    publishEvent(event);
  } catch (error) {
    log(error);
  }
};
