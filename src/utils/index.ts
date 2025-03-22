export function createPageUrl(pageName: string) {
    return '/' + pageName.toLowerCase().replace(/ /g, '-');
}

/**
 * Redirects to the login page with an optional redirect parameter
 * 
 * @param {string} redirectTo - The page to redirect to after login
 * @returns {string} The login URL with redirect parameter if provided
 */
export function redirectToLogin(redirectTo?: string) {
    const loginUrl = createPageUrl('Auth');
    
    if (redirectTo) {
        // Add redirect parameter to the URL
        return `${loginUrl}?redirect=${encodeURIComponent(redirectTo)}`;
    }
    
    return loginUrl;
}