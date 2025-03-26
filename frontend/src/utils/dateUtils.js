export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isValidDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

export const isFutureDate = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return checkDate > today;
};

export const getTimeSlots = (date, duration = 60) => {
  const slots = [];
  const start = new Date(date);
  start.setHours(8, 0, 0); // Start at 8 AM

  const end = new Date(date);
  end.setHours(17, 0, 0); // End at 5 PM

  while (start < end) {
    slots.push(new Date(start));
    start.setMinutes(start.getMinutes() + duration);
  }

  return slots;
};