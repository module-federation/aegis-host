'use strict'

import * as models from '../models'

/**
 * Compose functions to execute in left-to-right / top-to-bottom order
 * ```
 * compose(func1, func2)(ObjectToCompose);
 * 
 * // eqivalent to func2(func1(ObjectToCompose));
 * ```
 * @param  {...any} funcs 
 */
export default function compose(...funcs) {
  return function (initVal) {
    return funcs.reduceRight((v, f) => f(v), initVal);
  }
}

/*
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

console.log(compose(increment, decrement)(1));

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


function addId2(generateId) {
  return function (o) {
    const _id = generateId();
    return Object.assign({}, o, {
      id: _id,
      getId: () => _id
    });
  }
}

function addTimestamp(time) {
  return function (o) {
    const _created = time();
    return Object.assign({}, o, {
      id: _created,
      created: () => _created
    });
  }
}

const enrichEvent2 = (id, time) => o => compose(
  addId2(id),
  addTimestamp(time)
)(o);

const myObj = { var1: 'val1' };
const time = () => new Date().toUTCString();
const idgen = () => 'id777';
const enrich = enrichEvent2(idgen, time);
console.log('#############')
console.log(enrich(myObj));
console.log()

const enrichFactory = (function () {
  function addId(fnGeneratedId) {
    return function (o) {
      const _id = fnGeneratedId();
      return Object.assign({}, o, {
        id: _id,
        getId: () => _id
      });
    }
  }

  function addTimestamp(fnTimestamp) {
    return function (o) {
      const _created = fnTimestamp();
      return Object.assign({}, o, {
        id: _created,
        created: () => _created
      });
    }
  }

  const _enrichEvent = (id, time, eventType, modelName) => o => compose(
    addId(id),
    addTimestamp(time),
    // addEventName(eventType, modelName)
  )(o);

  const _enrichModel = (id, time, modelName) => o => compose(
    addId(id),
    addTimestamp(time),
    //  addModelName(modelName)
  )(o);

  const time = () => new Date().toUTCString();
  const idgen = () => 'id777';
  const enrichEvent = _enrichEvent(idgen, time);
  const enrichModel = _enrichModel();

  return {
    enrichEvent,
    enrichModel
  };
})();

enrichFactory.enrichEvent(myObj);

console.log('>>>>>>>>>>')
console.log(myObj);

//const myObjEnriched = enrichEvent2(idgen, time)(myObj);
//console.log(myObjEnriched);

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
*/