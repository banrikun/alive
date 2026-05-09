const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const timestamp = JSON.parse(fs.readFileSync('timestamp.json', 'utf8'));

const getTimeDiff = (lastUpdate) => {
  const now = new Date();
  const last = new Date(lastUpdate);
  return (now - last) / (1000 * 60 * 60);
};

const interpolate = (template, name) => {
  return template.includes('${name}') ? template.replace('${name}', name) : template;
};

const getCurrentStatus = (hours, statusConfig) => {
  // 从后往前找，返回第一个 hours <= 当前时间的配置
  for (let i = statusConfig.length - 1; i >= 0; i--) {
    if (hours >= statusConfig[i].hours) {
      return statusConfig[i];
    }
  }
  // 理论上不应该到这里，但作为保底返回第一个
  return statusConfig[0];
};

const shouldSendNotification = (hours, statusConfig) => {
  const currentStatus = getCurrentStatus(hours, statusConfig);

  // 如果配置中不需要通知，直接返回false
  if (!currentStatus.notify) {
    return false;
  }

  // 通知窗口：从状态的起始时间到起始时间+24小时
  const notificationWindowStart = currentStatus.hours;
  const notificationWindowEnd = currentStatus.hours + 24;

  // 判断当前时间是否在通知窗口内
  const inWindow = hours >= notificationWindowStart && hours < notificationWindowEnd;

  console.log(`Status starts at: ${currentStatus.hours}h`);
  console.log(`Notification window: ${notificationWindowStart}h - ${notificationWindowEnd}h`);
  console.log(`Current hours (${hours.toFixed(2)}) in notification window: ${inWindow}`);

  return inWindow;
};

const formatDuration = (hours) => {
  const days = Math.floor(hours / 24);
  const remainingHours = Math.floor(hours % 24);
  return `${days} 天 ${remainingHours} 小时`;
};

const generateEmailBody = (name, status, timestamp, hours) => {
  const zhText = interpolate(status.zh, name);
  const enText = interpolate(status.en, name);
  const lastUpdate = new Date(timestamp.last_update).toISOString();

  return `${zhText}

${enText}

Last update: ${lastUpdate}
Time elapsed: ${formatDuration(hours)}`;
};

const setEnvVar = (key, value) => {
  fs.appendFileSync(process.env.GITHUB_ENV, `${key}=${value}\n`);
};

const setMultilineEnvVar = (key, value) => {
  const delimiter = `EOF_${key}`;
  fs.appendFileSync(process.env.GITHUB_ENV, `${key}<<${delimiter}\n${value}\n${delimiter}\n`);
};

// Main
const testHours = process.env.TEST_HOURS;
const hours = testHours ? parseFloat(testHours) : getTimeDiff(timestamp.last_update);

console.log(`Hours since last update: ${hours.toFixed(2)}`);

const currentStatus = getCurrentStatus(hours, config.statusConfig);
const statusText = interpolate(currentStatus.zh, config.name);

console.log(`Current status: ${statusText}`);
console.log(`Notify flag in config: ${currentStatus.notify}`);

// 使用新的逻辑判断是否应该发送通知
const shouldNotify = shouldSendNotification(hours, config.statusConfig);

if (shouldNotify) {
  const emailSubject = `Status Alert: ${statusText}`;
  const emailBody = generateEmailBody(config.name, currentStatus, timestamp, hours);

  setEnvVar('SHOULD_NOTIFY', 'true');
  setEnvVar('EMAIL_SUBJECT', emailSubject);
  setMultilineEnvVar('EMAIL_BODY', emailBody);

  console.log('✅ Notification will be sent');
} else {
  setEnvVar('SHOULD_NOTIFY', 'false');
  console.log('ℹ️  No notification needed (either notify=false or outside notification window)');
}
