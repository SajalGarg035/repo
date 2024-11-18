import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Info, Calendar, User } from 'lucide-react';

const UserDetails = ({ studentInfo }) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          User Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        {studentInfo && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={studentInfo.photo}
                  alt="Student"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <span className="absolute bottom-0 right-0 h-4 w-4 bg-green-400 rounded-full border-2 border-white"></span>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {studentInfo.firstName} {studentInfo.lastName}
              </h3>
              <p className="text-gray-500">Section {studentInfo.section}</p>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Calendar className="w-4 h-4" />
                <span>Enrolled: {new Date(studentInfo.enrollmentDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>Username: {studentInfo.username}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserDetails;
