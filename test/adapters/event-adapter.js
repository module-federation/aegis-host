
// var assert = require('assert');
// import Model from '../../src/models/model';
// import { listen } from '../../src/adapters/event-adapter';
// import { Event } from '../services/event-service';

// describe('event-adapter', function () {
//   // describe('listen()', async function () {
//     it('should automatically unsubscribe on receipt of message', async function () {
//       const id = {};
//       function make() {
//         return (...b) => ({ a: 'a', b });
//       }
//       const adapters = {
//         listen: listen(Event),
//         async test({ model }) {
//           const subscription = await model.listen({
//             topic: 'test',
//             id: id,
//             filter: 'test',
//             once: true,
//             model,
//             callback: ({ subscription }) => subscription
//           });
//           console.log({ subscriptions: subscription.getSubscriptions()[0] });
//         }
//       }
//       const model = await Model.create({
//         spec: {
//           modelName: 'ABC',
//           factory: make(),
//           ports: {
//             listen: {
//               type: 'outbound'
//             },
//             test: {
//               type: 'outbound'
//             }
//           },
//           dependencies: adapters
//         },
//         args: [{ c: 'c' }]
//       });
//       const subscription = await model.test();
//       console.log({ subscriptions: subscription.getSubscriptions()[0] });
//       assert.strictEqual(
//         false, subscription.getSubscriptions()[0][1].delete(id)
//       );
//     });
//   });
// });