export const versionFromUrl = (wnd) => wnd ? wnd?.location?.pathname?.match(/([0-9]\.[0-9])/i)[1] : ""
export const viewPath = (view) => `/${versionFromUrl()}/resources.html#${view}`
