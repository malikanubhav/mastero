export function pagination(defaultLimit = 10, maxLimit = 100) {
    return (req, _res, next) => {
        const page = Math.max(1, parseInt(req.query.page ?? "1", 10));
        const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit ?? `${defaultLimit}`, 10)));
        req.page = page;
        req.limit = limit;
        req.offset = (page - 1) * limit;
        next();
    };
}
