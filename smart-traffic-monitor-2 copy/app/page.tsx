"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950">
      <Card className="bg-gray-900/80 border-0 shadow-2xl ring-1 ring-gray-700 w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent text-center">
            Real-Time Urban Traffic Monitoring Solution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 text-lg text-center mt-2">
            Stay updated with live traffic insights and urban mobility
            analytics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
