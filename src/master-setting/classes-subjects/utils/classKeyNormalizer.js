export const normalizeClassKey = (className) => {
    if (!className) return "";

    return className
        .replace(" (Science)", "-Science")
        .replace(" (Commerce)", "-Commerce")
        .replace(" (Arts)", "-Arts")
        .replace(" (Agriculture)", "-Agriculture");
};