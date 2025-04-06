import { Helmet, HelmetProvider } from "react-helmet-async";

/**
 * PageMeta Component
 * 
 * A component for handling page meta information like title and description
 * 
 * @param {string} title - The page title
 * @param {string} description - The page meta description
 */
const PageMeta = ({
  title,
  description,
}) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
  </Helmet>
);

/**
 * AppWrapper Component
 * 
 * A wrapper component providing HelmetProvider for use with PageMeta
 * 
 * @param {React.ReactNode} children - The child components to wrap
 */
export const AppWrapper = ({ children }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

export default PageMeta; 