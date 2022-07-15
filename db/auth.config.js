module.exports = {
  secret: "somesupersecretkey",
  jwtExpiration: 28800, // 1 hour
  jwtRefreshExpiration: 86400, // 24 hours
  /* for test */
  // jwtExpiration: 60,          // 1 minute
  // jwtRefreshExpiration: 120,  // 2 minutes
};
