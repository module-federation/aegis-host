

export const withId = (fnCreateId) => o => ({
  id: fnCreateId(),
  ...o,
});

export const withTimestamp = (fnTimestamp) => o => ({
  created: fnTimestamp(),
  ...o,
});

export const withEventTimestamp = (fnTimestamp) => o => {
  const propName = () => o.eventType.toLowerCase() + 'd';
  return {
    [propName()]: fnTimestamp(),
    ...o
  }
}

export const utc = () => new Date().toUTCString();








