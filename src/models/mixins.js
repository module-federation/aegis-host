'use strict'

export const withId = (fnCreateId) => o => ({
  id: fnCreateId(),
  ...o,
});

export const withTimestamp = (
  propName = 'timestamp',
  fnTimestamp = utc
) => o => ({
  [propName]: fnTimestamp(),
  ...o,
});

export const withPropertyTimestamp = (
  prop,
  fnProp = (p) => p.toLowerCase() + 'Time',
  fnTimestamp = utc
) => o => {
  const propName = fnProp(
    ((o.hasOwnProperty(prop)) ? o[prop] : 'event')
  );
  return {
    [propName]: fnTimestamp(),
    ...o
  }
}

export const utc = () => new Date().toUTCString();








