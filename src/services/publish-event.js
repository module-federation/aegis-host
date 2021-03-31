export default async (event, observer) => {
  try {
    const publishEvent = (await import("microservices/services")).publishEvent;
    publishEvent(event, observer);
  } catch (error) {
    console.error(error);
  }
};
