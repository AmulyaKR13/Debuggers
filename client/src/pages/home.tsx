import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useIsAuthenticated } from "@/lib/auth";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="material-icons text-primary text-3xl mr-2">brain</span>
            <span className="text-xl font-semibold">NeurAllocate</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                AI-Powered Task Allocation
              </h1>
              <p className="text-lg mb-8 text-gray-600 dark:text-gray-300 max-w-xl">
                NeurAllocate revolutionizes work distribution by incorporating cognitive AI, behavioral analysis, and real-time optimization to ensure the most efficient task assignments.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="flex items-center">
                    <span className="material-icons mr-2">rocket_launch</span>
                    Get Started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="flex items-center">
                    <span className="material-icons mr-2">login</span>
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-primary rounded-lg opacity-10 blur-xl"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center mb-6">
                    <span className="material-icons text-primary text-3xl mr-2">psychology</span>
                    <h3 className="text-xl font-semibold">Neuro-Behavioral AI Matching</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <span className="material-icons text-green-500 mt-1 mr-2">check_circle</span>
                      <div>
                        <h4 className="font-medium">Cognitive Analysis</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Matches tasks based on cognitive strengths and current mental state</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="material-icons text-green-500 mt-1 mr-2">check_circle</span>
                      <div>
                        <h4 className="font-medium">Adaptive Expertise Evolution</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Learns and adapts to growing skills, suggesting upskilling opportunities</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="material-icons text-green-500 mt-1 mr-2">check_circle</span>
                      <div>
                        <h4 className="font-medium">Sentiment-Based Assignment</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Detects motivation and energy levels for optimal productivity</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="material-icons text-green-500 mt-1 mr-2">check_circle</span>
                      <div>
                        <h4 className="font-medium">AI Conflict Resolution</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Automatically detects and resolves workload conflicts</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Key Features</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our AI-driven system provides a comprehensive solution for task management and team optimization
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <span className="material-icons text-primary text-2xl">auto_awesome</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Matching</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Advanced algorithms match tasks to the most suitable team members based on skills, availability, and real-time cognitive analysis.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <span className="material-icons text-green-600 dark:text-green-400 text-2xl">balance</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Workload Optimization</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Dynamic Availability Intelligence ensures balanced workloads across your team, preventing burnout and maximizing productivity.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <div className="bg-violet-100 dark:bg-violet-900/30 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <span className="material-icons text-violet-600 dark:text-violet-400 text-2xl">school</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Skill Development</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Adaptive Expertise Evolution tracks skill progression and provides personalized learning recommendations for growth.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <span className="material-icons text-amber-600 dark:text-amber-400 text-2xl">psychology</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Cognitive Analysis</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Analyzes cognitive strengths and current mental state to assign tasks that align with each individual's capacity.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <span className="material-icons text-red-600 dark:text-red-400 text-2xl">mood</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sentiment Analysis</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Utilizes emotion AI to detect motivation and energy levels, ensuring tasks match current emotional state.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <div className="bg-teal-100 dark:bg-teal-900/30 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <span className="material-icons text-teal-600 dark:text-teal-400 text-2xl">security</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Authentication</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Robust authentication with email verification, secure login notifications, and comprehensive account management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary bg-opacity-10 dark:bg-primary dark:bg-opacity-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Ready to optimize your workflow?</h2>
          <p className="text-lg mb-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join thousands of teams using NeurAllocate to revolutionize their task distribution and team management.
          </p>
          <Link href="/register">
            <Button size="lg" className="flex items-center mx-auto">
              <span className="material-icons mr-2">rocket_launch</span>
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center">
                <span className="material-icons text-primary mr-2">brain</span>
                <span className="font-semibold">NeurAllocate</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                AI-Powered Task Allocation System
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center text-sm text-gray-500 dark:text-gray-400">
              <span>Powered by Microsoft AI Foundry</span>
              <div className="hidden md:block mx-4 h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex gap-4 mt-4 md:mt-0">
                <a href="#" className="hover:text-primary">Documentation</a>
                <a href="#" className="hover:text-primary">Support</a>
                <a href="#" className="hover:text-primary">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
