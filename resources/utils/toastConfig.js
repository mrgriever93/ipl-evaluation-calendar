const commonConfig = {
  pauseOnHover: false,
  autoClose: 3000,
  pauseOnFocusLoss: false,
};

export const successConfig = {
  ...commonConfig,
  type: 'success',

};

export const errorConfig = {
  ...commonConfig,
  type: 'error',
};
