"use client";

import { SignUpButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function LandingPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already signed in
  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, router]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Grow Your YouTube Channel with AI-Powered Content Ideas
              </h1>
              <p className="text-xl text-gray-700">
                Our AI analyzes your channel, learns what works, and suggests new content ideas that your audience will love.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <SignUpButton mode="modal">
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium">
                    Get Started Free
                  </button>
                </SignUpButton>
                <a href="#features" className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium text-center">
                  Learn More
                </a>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25"></div>
                <div className="relative bg-white p-6 rounded-lg shadow-xl">
                  <Image 
                    src="/youtube-planner-hero.png" 
                    alt="YouTube Planner Dashboard" 
                    className="rounded-md shadow-sm"
                    width={600}
                    height={400}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = "https://placehold.co/600x400/e2e8f0/475569?text=YouTube+Planner";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Connect Your Channel" 
              description="Link your YouTube channel and our AI will analyze your content, audience, and performance metrics."
              icon="🔗"
            />
            <FeatureCard 
              title="Get Personalized Ideas" 
              description="Receive AI-generated content ideas tailored to your niche, audience preferences, and channel growth goals."
              icon="💡"
            />
            <FeatureCard 
              title="Research Competitors" 
              description="Analyze what's working for similar channels and get insights to help you stand out."
              icon="📊"
            />
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Premium Features</h2>
          <p className="text-center text-gray-700 mb-12 max-w-3xl mx-auto">
            Unlock advanced features to supercharge your channel growth
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <PremiumFeatureCard 
              title="Competitor Analysis" 
              description="Deep dive into what's working for your competitors. Analyze their top-performing content, posting frequency, and audience engagement strategies."
            />
            <PremiumFeatureCard 
              title="Trending Topics" 
              description="Get early access to trending topics in your niche before they go mainstream. Stay ahead of the curve with our predictive AI."
            />
            <PremiumFeatureCard 
              title="Advanced Content Ideas" 
              description="Receive unlimited high-quality content ideas with detailed outlines, keyword suggestions, and performance predictions."
            />
            <PremiumFeatureCard 
              title="Performance Analytics" 
              description="Track how your content performs against AI predictions and get actionable insights to improve future videos."
            />
          </div>
          <div className="text-center mt-12">
            <Link href="/pricing" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What Creators Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="This tool helped me double my subscriber count in just 3 months by suggesting content my audience actually wanted to see."
              author="Alex Chen"
              role="Tech Reviewer"
              avatar="https://randomuser.me/api/portraits/men/32.jpg"
            />
            <TestimonialCard 
              quote="The competitor analysis feature is worth the premium subscription alone. I've discovered so many content opportunities I was missing."
              author="Sarah Johnson"
              role="Fitness Creator"
              avatar="https://randomuser.me/api/portraits/women/44.jpg"
            />
            <TestimonialCard 
              quote="I was struggling with content ideas after 2 years on YouTube. This tool helped me find fresh angles that my subscribers love."
              author="Michael Torres"
              role="Gaming Channel"
              avatar="https://randomuser.me/api/portraits/men/67.jpg"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Grow Your Channel?</h2>
          <p className="text-xl mb-8">
            Join thousands of creators who are using AI to take their content to the next level.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <SignUpButton mode="modal">
              <button className="px-6 py-3 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors font-medium">
                Get Started Free
              </button>
            </SignUpButton>
            <Link href="/pricing" className="px-6 py-3 border border-white rounded-md hover:bg-blue-700 transition-colors font-medium">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function PremiumFeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center mb-4">
        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
          PREMIUM
        </span>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function TestimonialCard({ quote, author, role, avatar }: { quote: string; author: string; role: string; avatar: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <p className="text-gray-700 mb-4 italic">&quot;{quote}&quot;</p>
      <div className="flex items-center">
        <Image 
          src={avatar} 
          alt={author} 
          className="w-10 h-10 rounded-full mr-3"
          width={40}
          height={40}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.src = "https://placehold.co/100/e2e8f0/475569?text=User";
          }}
        />
        <div>
          <p className="font-medium">{author}</p>
          <p className="text-gray-500 text-sm">{role}</p>
        </div>
      </div>
    </div>
  );
}
