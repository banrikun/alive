export const getHoursSince = (lastUpdate, now = new Date()) => {
  const last = new Date(lastUpdate);

  return (now - last) / (1000 * 60 * 60);
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
