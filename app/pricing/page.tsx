"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PricingPage() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const updatePremiumStatus = useMutation(api.users.updatePremiumStatus);

  // For demo purposes, we'll simulate upgrading to premium
  const handleUpgrade = async (plan: string) => {
    if (!isSignedIn || !user) {
      router.push("/sign-in");
      return;
    }

    try {
      setIsUpdating(true);
      
      // In a real app, this would redirect to a payment processor
      // For this demo, we'll just update the user's premium status
      await updatePremiumStatus({
        userId: user.id,
        isPremium: true,
      });
      
      // Redirect to dashboard after "payment"
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to upgrade:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Select the plan that best fits your YouTube channel growth goals
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Free Plan */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Free</h2>
            <p className="text-gray-500 mt-1">Get started with basic features</p>
            <div className="mt-4">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-gray-500">/month</span>
            </div>
          </div>
          
          <ul className="space-y-3 mb-8">
            <PlanFeature text="Connect 1 YouTube channel" included={true} />
            <PlanFeature text="3 content ideas per month" included={true} />
            <PlanFeature text="Basic trending topics" included={true} />
            <PlanFeature text="Competitor analysis" included={false} />
            <PlanFeature text="Advanced content ideas" included={false} />
            <PlanFeature text="Premium trending topics" included={false} />
          </ul>
          
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Current Plan
          </button>
        </div>
        
        {/* Pro Plan */}
        <div className="bg-white rounded-lg shadow-md border-2 border-blue-500 p-6 transform md:scale-105 z-10">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              MOST POPULAR
            </span>
          </div>
          
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Pro</h2>
            <p className="text-gray-500 mt-1">Perfect for growing creators</p>
            <div className="mt-4">
              <span className="text-4xl font-bold">$19</span>
              <span className="text-gray-500">/month</span>
            </div>
          </div>
          
          <ul className="space-y-3 mb-8">
            <PlanFeature text="Connect 3 YouTube channels" included={true} />
            <PlanFeature text="Unlimited content ideas" included={true} />
            <PlanFeature text="All trending topics" included={true} />
            <PlanFeature text="Competitor analysis (3 competitors)" included={true} />
            <PlanFeature text="Advanced content ideas" included={true} />
            <PlanFeature text="Performance predictions" included={false} />
          </ul>
          
          <button
            onClick={() => handleUpgrade("pro")}
            disabled={isUpdating}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isUpdating ? "Processing..." : "Upgrade to Pro"}
          </button>
        </div>
        
        {/* Premium Plan */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Premium</h2>
            <p className="text-gray-500 mt-1">For serious content creators</p>
            <div className="mt-4">
              <span className="text-4xl font-bold">$49</span>
              <span className="text-gray-500">/month</span>
            </div>
          </div>
          
          <ul className="space-y-3 mb-8">
            <PlanFeature text="Connect unlimited channels" included={true} />
            <PlanFeature text="Unlimited content ideas" included={true} />
            <PlanFeature text="All trending topics" included={true} />
            <PlanFeature text="Unlimited competitor analysis" included={true} />
            <PlanFeature text="Advanced content ideas" included={true} />
            <PlanFeature text="Performance predictions" included={true} />
            <PlanFeature text="Priority support" included={true} />
          </ul>
          
          <button
            onClick={() => handleUpgrade("premium")}
            disabled={isUpdating}
            className="w-full py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors disabled:opacity-50"
          >
            {isUpdating ? "Processing..." : "Upgrade to Premium"}
          </button>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="mt-20 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          <FaqItem 
            question="Can I cancel my subscription at any time?" 
            answer="Yes, you can cancel your subscription at any time. Your premium features will remain active until the end of your billing period."
          />
          <FaqItem 
            question="How do I connect my YouTube channel?" 
            answer="After signing up, you can connect your YouTube channel from the dashboard. Simply paste your channel URL and our system will analyze your content."
          />
          <FaqItem 
            question="How accurate are the content ideas?" 
            answer="Our AI analyzes your channel performance, audience engagement, and current trends to generate highly relevant content ideas. The more data we have from your channel, the more accurate the suggestions become."
          />
          <FaqItem 
            question="Can I upgrade or downgrade my plan later?" 
            answer="Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at the start of your next billing cycle."
          />
          <FaqItem 
            question="Do you offer a free trial of premium features?" 
            answer="We don't currently offer a free trial, but our free plan gives you access to basic features so you can experience the value before upgrading."
          />
        </div>
      </div>
    </div>
  );
}

function PlanFeature({ text, included }: { text: string; included: boolean }) {
  return (
    <li className="flex items-center">
      {included ? (
        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )}
      <span className={included ? "text-gray-800" : "text-gray-500"}>{text}</span>
    </li>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-gray-200 pb-4">
      <button
        className="flex justify-between items-center w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-medium text-gray-900">{question}</h3>
        <svg
          className={`w-5 h-5 text-gray-500 transform ${isOpen ? "rotate-180" : ""}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="mt-2">
          <p className="text-gray-600">{answer}</p>
        </div>
      )}
    </div>
  );
}

