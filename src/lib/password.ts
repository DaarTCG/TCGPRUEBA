import bcrypt from "bcryptjs";

/** Cost factor de bcrypt (requisito: >= 12). */
export const BCRYPT_COST = 12;

export const hashPassword = (plain: string) => bcrypt.hash(plain, BCRYPT_COST);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);
