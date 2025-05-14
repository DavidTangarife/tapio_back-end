var xoauth2 = require('xoauth2'),
  xoauth2gen;

// ===========================================================
// Get the xoauth2 generator needed to roll the XOAUTH2 token.
// ===========================================================
export function get_xoauth2_generator(email: string, refreshToken: string, accessToken: string) {
  xoauth2gen = xoauth2.createXOAuth2Generator({
    user: email,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: refreshToken,
    scope: 'https://mail.google.com/',
    customHeaders: { 'Authorization': 'Bearer ' + accessToken }
  });
  return xoauth2gen
}

// ==========================================================
// Now the generator is set up get the token.
// ==========================================================
export async function get_xoauth2_token(xoauth2gen: any) {
  let token = ''
  token = await xoauth2gen.getToken(function(err: string, token: string) {
    console.log('in callback ' + token)
    return token;
  })
  console.log('in function' + token)
  return token
}

