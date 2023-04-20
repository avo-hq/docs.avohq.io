export const versionFromUrl = (windw) => windw?.location?.pathname?.match(/([0-9]\.[0-9])/i)[1]
export const viewPath = (windw = null, view) => `/${versionFromUrl(windw)}/resources.html#${view}`
