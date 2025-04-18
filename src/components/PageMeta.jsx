import { Helmet, HelmetProvider } from "react-helmet-async";
/**
 * PageMeta Component
 * 
 * A component for handling page meta information like title, description, and structured data schema.
 * 
 * @param {string} title - The page title
 * @param {string} description - The page meta description
 * @param {object} [schema] - Optional JSON-LD schema object to embed
 */
const PageMeta = ({
  title,
  description,
  schema,
}) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    {schema && (
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    )}
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