import log from "@module-federation/aegis/esm/lib/logger";

export default async (event, observer) => {
  try {
    const publishEvent = (await import("orderService/services")).publishEvent;
    publishEvent(event, observer);
  } catch (error) {
    log(error);
  }
};
