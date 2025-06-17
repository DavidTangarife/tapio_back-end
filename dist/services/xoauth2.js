"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_xoauth2_generator = get_xoauth2_generator;
exports.get_xoauth2_token = get_xoauth2_token;
var xoauth2 = require('xoauth2'), xoauth2gen;
// ===========================================================
// Get the xoauth2 generator needed to roll the XOAUTH2 token.
// ===========================================================
function get_xoauth2_generator(email, refreshToken, accessToken) {
    xoauth2gen = xoauth2.createXOAuth2Generator({
        user: email,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: refreshToken,
        scope: 'https://mail.google.com/',
        customHeaders: { 'Authorization': 'Bearer ' + accessToken }
    });
    return xoauth2gen;
}
// ==========================================================
// Now the generator is set up get the token.
// ==========================================================
// export async function get_xoauth2_token(xoauth2gen: any) {
//   let token = ''
//   token = await xoauth2gen.getToken(function(err: string, token: string) {
//     console.log('in callback ' + token)
//     return token;
//   })
//   console.log('in function' + token)
//   return token
// }
// export async function generateTokenPromise(xoauth2gen: any) {
//   return new Promise(resolve => {
//     resolve(xoauth2gen.getToken((err: string, token: string) => {
//       if (err) {
//         console.log(err)
//       }
//       return token
//     }))
//   })
// }
function get_xoauth2_token(xoauth2gen) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            xoauth2gen.getToken((err, token) => {
                if (err)
                    reject(err);
                else
                    resolve(token);
            });
        });
    });
}
