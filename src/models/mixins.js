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
  p,
  fn_p = (p) => p.toLowerCase() + 'Time',
  fnTimestamp = utc
) => o => {
  const propName = fn_p(((o.hasOwnProperty(p)) ? o[p] : 'event'));
  return {
    [propName]: fnTimestamp(),
    ...o
  }
}

export const utc = () => new Date().toUTCString();








