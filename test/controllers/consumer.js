import { consumeEvents } from '../../src/controllers';


describe('Customer events', function () {
  it('consumeEvents', function () {

    const ShippingService = function (name) { this.name = name };

    ShippingService.prototype.getSubscription = function () {
      return {
        name: this.name,
        handler: (data) => data
      }
    }
    const shipSvc = new ShippingService('logistics');

    consumeEvents(shipSvc.getSubscription(), function (eventSrc) {
      console.log('comsumeEvents eventSrc');
      console.log(eventSrc);
      const { name, handler } = this;
      eventSrc.subscribe(name, handler);
    });

  });
});
