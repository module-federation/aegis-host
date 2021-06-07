let service;

const EventBus = {
  async listen(...args) {
    if (!service) {
      service = (await import("microservices/event-bus")).EventBus;
    }
    console.debug("calling service.listen()", args);
    return service.listen(...args);
  },
  async notify(...args) {
    if (!service) {
      service = (await import("microservices/event-bus")).EventBus;
    }
    return service.notify(...args);
  },
};

export default EventBus;
