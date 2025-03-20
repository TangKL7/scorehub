'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CreateTournamentPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would save the tournament data here
    // For now, we'll just redirect to the tournaments list
    router.push('/dashboard/tournaments');
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Create Tournament"
        description="Set up a new padel tournament"
      />

      <Card className="max-w-3xl mx-auto mt-8">
        <form onSubmit={handleSubmit}>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Tournament Title</Label>
              <Input id="title" placeholder="Enter tournament title" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Enter location" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Tournament Format</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single-elimination">Single Elimination</SelectItem>
                    <SelectItem value="double-elimination">Double Elimination</SelectItem>
                    <SelectItem value="round-robin">Round Robin</SelectItem>
                    <SelectItem value="league">League</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-participants">Maximum Participants</Label>
                <Input id="max-participants" type="number" min="2" placeholder="16" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Provide details about the tournament..." 
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="registration-deadline">Registration Deadline</Label>
                <Input id="registration-deadline" type="date" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="entry-fee">Entry Fee</Label>
                <Input id="entry-fee" placeholder="e.g. €50 per team" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/dashboard/tournaments')}
            >
              Cancel
            </Button>
            <Button type="submit">Create Tournament</Button>
          </CardFooter>
        </form>
      </Card>
    </DashboardLayout>
  );
} 