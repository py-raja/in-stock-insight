
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-6 max-w-md">
        <h1 className="text-6xl font-bold text-erp-blue mb-6">404</h1>
        <p className="text-2xl font-medium text-gray-700 mb-4">Page Not Found</p>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button>
            <HomeIcon className="h-4 w-4 mr-2" /> Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
