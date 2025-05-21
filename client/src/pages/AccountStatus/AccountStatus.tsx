import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from "../../components/ui/button";

export default function AccountStatus() {
  const location = useLocation();
  const { success, message, errorDetails } = location.state || {};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md text-center">
        {success ? (
          <>
            <h2 className="text-2xl font-bold text-green-600">Account Deleted Successfully!</h2>
            <p className="text-gray-700">{message || "Your account and associated data have been successfully deleted."}</p>
            <Link to="/login">
              <Button className="w-full bg-green-800 hover:bg-green-900">Go to Login</Button>
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-red-600">Account Deletion Failed</h2>
            <p className="text-gray-700">{message || "There was an error deleting your account."}</p>
            {errorDetails && (
              <p className="text-sm text-gray-500">Details: {errorDetails}</p>
            )}
            <div className="mt-4 flex justify-center space-x-4">
              {/* Optionally add a button to try again or contact support */}
               <Link to="/login">
                <Button variant="outline">Go to Login</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 