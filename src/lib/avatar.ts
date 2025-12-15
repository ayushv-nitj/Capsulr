// import md5 from "md5";

// export function getAvatarUrl(email: string) {
//   const hash = md5(email.trim().toLowerCase());
//   return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
// }


import md5 from 'md5';

export function getAvatarUrl(email: string | null | undefined) {
  if (!email) {
    // Return default Gravatar for empty email
    return 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon';
  }
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
}