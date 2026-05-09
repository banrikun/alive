const toDate = (value, fallback = new Date()) => {
  const fallbackDate = fallback instanceof Date ? fallback : new Date(fallback);

  if (value === undefined || value === null || value === '') {
    return fallbackDate;
  }

  const parsed = value instanceof Date ? value : new Date(value);

  return Number.isNaN(parsed.getTime()) ? fallbackDate : parsed;
};

export const normalizeTimestamp = (timestamp, now = new Date()) => {
  return {
    last_update: toDate(timestamp?.last_update, now).toISOString(),
  };
};

export const getHoursSince = (lastUpdate, now = new Date()) => {
  const currentTime = toDate(now);
  const lastUpdateTime = toDate(lastUpdate, currentTime);

  return (currentTime.getTime() - lastUpdateTime.getTime()) / (1000 * 60 * 60);
};

export const interpolate = (template, name) => {
  return template.includes('${name}') ? template.replace('${name}', name) : template;
};

export const getCurrentStatus = (hours, statusConfig) => {
  for (let i = statusConfig.length - 1; i >= 0; i -= 1) {
    if (hours >= statusConfig[i].hours) {
      return statusConfig[i];
    }
  }

  return statusConfig[0];
};

export const formatDuration = (hours) => {
  const days = Math.floor(hours / 24);
  const remainingHours = Math.floor(hours % 24);

  return `${days} 天 ${remainingHours} 小时`;
};

export const formatIsoTimestamp = (timestamp) => {
  return toDate(timestamp).toISOString();
};
