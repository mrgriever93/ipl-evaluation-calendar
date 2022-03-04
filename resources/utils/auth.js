export const hasValidAuthToken = () => {
  const authTokenExpiry = localStorage.getItem("access_token_expiry");
  const authToken = localStorage.getItem("accessToken");
  if (!authTokenExpiry || !authToken) return false;
  const currentTimestamp = Math.floor(new Date() / 1000);
  return authTokenExpiry > currentTimestamp;
};

export const hasValidRefreshToken = () => {
  const refreshTokenExpiry = localStorage.getItem("refresh_token_expiry");
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshTokenExpiry || !refreshToken) return false;
  const currentTimestamp = Math.floor(new Date() / 1000);
  return refreshTokenExpiry > currentTimestamp;
};
