
import React from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-6">
        <h1 className="text-6xl font-bold text-team-blue mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-6">
          We couldn't find the page you were looking for. The page might have been moved or deleted.
        </p>
        <Button asChild>
          <Link to="/">Return to Dashboard</Link>
        </Button>
        <p className="text-xs text-gray-400 mt-6">
          URL: {location.pathname}
        </p>
      </div>
    </div>
  );
};

export default NotFound;
