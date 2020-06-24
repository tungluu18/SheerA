import stringHash from 'string-hash';

export const hashUserId = (userId) =>
  !userId ? userId
    : Array.isArray(userId)
      ? userId.map(id => "User" + stringHash(id))
      : "User" + stringHash(userId)
