'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import TournamentLayout from '@/components/layouts/TournamentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Trophy, Users, Clock } from 'lucide-react';

export default function TournamentDetailPage() {
  const params = useParams();
  const tournamentId = params.tournamentId as string;
  
  // In a real app, you would fetch the tournament details based on the ID
  // This is mock data for demonstration
  const tournament = {
    id: tournamentId,
    title: 'Summer Padel Championship',
    date: '2023-08-15',
    location: 'Barcelona Padel Club',
    format: 'Double Elimination',
    participants: 24,
    status: 'Upcoming',
    description: 'Join us for the annual Summer Padel Championship at Barcelona Padel Club. This tournament features players of all skill levels competing in a double elimination format.',
    startTime: '09:00',
    endTime: '18:00',
    registrationDeadline: '2023-08-10',
    entryFee: '€50 per team',
    prizes: '1st Place: €500, 2nd Place: €250, 3rd Place: €100',
    organizer: 'Barcelona Padel Association'
  };

  return (
    <TournamentLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">{tournament.title}</h1>
            <div className="flex items-center">
              <span className="bg-primary/10 text-primary px-2 py-1 text-sm rounded-full">
                {tournament.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">Date</div>
                    <div>{new Date(tournament.date).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">Time</div>
                    <div>{tournament.startTime} - {tournament.endTime}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">Location</div>
                    <div>{tournament.location}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">Format</div>
                    <div>{tournament.format}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">Registration Deadline</div>
                  <div>{new Date(tournament.registrationDeadline).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">Participants</div>
                  <div>{tournament.participants} players registered</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="h-5 w-5 mr-2 text-gray-500">€</div>
                <div>
                  <div className="text-sm font-medium">Entry Fee</div>
                  <div>{tournament.entryFee}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tournament Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{tournament.description}</p>
            <div className="mt-4 space-y-2">
              <p><strong>Prizes:</strong> {tournament.prizes}</p>
              <p><strong>Organizer:</strong> {tournament.organizer}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </TournamentLayout>
  );
} 