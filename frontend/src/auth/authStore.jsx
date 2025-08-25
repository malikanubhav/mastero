import { atom } from "jotai";

export const tokenAtom = atom(localStorage.getItem("token") || "");
export const userAtom = atom(() => {
    const raw = localStorage.getItem("user");
    try {
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
});
