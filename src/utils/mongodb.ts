// Helper to generate MongoDB-like ObjectIDs in frontend
export const generateObjectId = (): string => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
  const random = Array(16)
    .fill(0)
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');
  return timestamp + random;
};