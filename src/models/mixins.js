

export const withId = (fnCreateId) => o => ({
  id: fnCreateId(),
  ...o,
});

export const withTimestamp = (fnTimestamp) => o => ({
  createTime: fnTimestamp(),
  ...o,
});

export const withEventTimestamp = (fnTimestamp) => o => {
  const propName = () => o.eventType.toLowerCase() + 'Time';
  return {
    [propName()]: fnTimestamp(),
    ...o
  }
}

export const utc = () => new Date().toUTCString();








