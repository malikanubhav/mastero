import bcrypt from "bcrypt";

export const hashPassword = (text)=>{
    return bcrypt.hash(text,10);
}

export const checkPassword = (text,hash)=>{
    return bcrypt.compare(text,hash);
}
