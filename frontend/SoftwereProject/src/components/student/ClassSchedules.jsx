import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Book, User, Clock, CheckCircle, XCircle } from 'lucide-react';

const ClassSchedules = ({ schedules, studentInfo }) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="w-5 h-5" />
          Class Schedules
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {schedules.map((schedule) => (
            <div
              key={schedule._id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">{schedule.className}</h3>
                  <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    {schedule.section}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{schedule.professorId.username}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {schedule.schedule.day} {schedule.schedule.startTime} - {schedule.schedule.endTime}
                    </span>
                  </div>
                </div>
              </div>

              {studentInfo?.attendance
                ?.filter((attendance) => attendance.classId._id === schedule._id)
                .map((attendance) => (
                  <div
                    key={attendance._id}
                    className="p-3 flex items-center justify-between border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {attendance.present ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-gray-600">
                        {new Date(attendance.date).toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        attendance.present
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {attendance.present ? 'Present' : 'Absent'}
                    </span>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassSchedules;
