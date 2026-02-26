
export const calculatePosition = (startMinute, zoomFactor) => {
  return startMinute * zoomFactor;
};

export const calculateHeight = (durationMinutes, zoomFactor) => {
  return Math.max(durationMinutes * zoomFactor, 15 * zoomFactor); // Minimum 15 mins visual height
};

export const snapToGrid = (minutes, gridMinutes = 15) => {
  return Math.round(minutes / gridMinutes) * gridMinutes;
};

export const pixelsToMinutes = (pixels, zoomFactor) => {
  return pixels / zoomFactor;
};

export const formatTimeHint = (startMinute, durationMinutes) => {
  const format = (mins) => {
    const h = Math.floor(mins / 60);
    const m = Math.floor(mins % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };
  const endMinute = startMinute + durationMinutes;
  return `${format(startMinute)} - ${format(endMinute)}`;
};

export const extractStartMinute = (dateString) => {
  if (!dateString) return 480; // Default 8:00 AM
  const d = new Date(dateString);
  return d.getHours() * 60 + d.getMinutes();
};

export const createDateWithTime = (baseDate, minutes) => {
  const d = new Date(baseDate);
  d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return d.toISOString();
};
