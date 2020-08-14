
export default function compose(...funcs) {
  return function (initVal) {
    return funcs.reduceRight((v, f) => f(v), initVal);
  }
}

function increment(num) {
  const sum = num + 1;
  console.log(`increment: ${sum}`);
  return sum;
}

function decrement(num) {
  const diff = num - 1;
  console.log(`decrement: ${diff}`);
  return diff;
}

const incrementDecrement = compose(
  increment,
  increment,
  decrement
);

console.log(incrementDecrement(1));

function addId(obj) {
  const _id = obj.generateId();
  return Object.assign({}, obj, {
    id: _id,
    getId: () => _id
  });
}

function addEventName(obj) {
  const { eventType, modelName } = obj;
  const _eventName = eventType + modelName;
  return Object.assign({}, obj, {
    eventName: _eventName,
    getEventName: () => _eventName,
  });
}

const enrichEvent = compose(
  addId,
  addEventName
);

const eventObj = {
  field1: 'val1',
  field2: 'val2'
}

const params = {
  generateId: () => 'ID-123',
  eventType: 'CREATE',
  modelName: 'MODEL1',
};

const args = { ...eventObj, ...params };

const enrichedEvent = enrichEvent(args);

// const enrichedEvent = enrichEvent(Object.assign({}, eventObj, {
//   generateId: () => 'ID-123',
//   eventType: 'CREATE',
//   modelName: 'MODEL1',
// }));

console.log(enrichedEvent);
console.log(
  enrichedEvent.getId()
);
console.log(
  enrichedEvent.getEventName()
);
console.log(
  enrichedEvent.generateId()
)