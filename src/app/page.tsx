'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layouts/MainLayout';
import { Trophy, Calendar, Users, BarChart } from 'lucide-react';

export default function LandingPage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/80 to-primary py-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Simplify Tournament Management for Padel Clubs
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            ScoreHub provides everything you need to run successful padel tournaments, from registration to real-time scoring.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">Register</Button>
            </Link>
            <Link href="/tournaments">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20">
                Browse Tournaments
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Run Successful Tournaments
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Tournament Management</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create and customize tournaments with flexible formats, categories, and rules.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Scheduling</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Automatically schedule matches across courts while avoiding player conflicts.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Player Management</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Manage registrations, track player statistics, and handle team formation.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <BarChart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Real-time Scoring</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Update scores in real-time and automatically generate brackets and standings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to streamline your tournament management?</h2>
          <p className="text-xl mb-8 text-gray-600 dark:text-gray-400">
            Join clubs around the world who use ScoreHub to create exceptional padel tournaments.
          </p>
          <Link href="/register">
            <Button size="lg">Register Today</Button>
          </Link>
        </div>
      </section>
    </MainLayout>
  );
}
