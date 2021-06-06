let service;

const EventBus = {
  async listen(...args) {
    if (!service) {
      service = (await import("microservices/event-bus")).EventBus;
    }
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
