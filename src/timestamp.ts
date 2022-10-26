export const timestamp = () => {
  return process.hrtime.bigint();
};
