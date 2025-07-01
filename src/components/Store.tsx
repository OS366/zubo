import React from "react";
import { ShoppingCart, Heart, Zap } from "lucide-react";

interface StoreProps {
  onBack: () => void;
  currentLevel?: number;
}

export const Store: React.FC<StoreProps> = ({ onBack, currentLevel = 0 }) => {
  const packages = [
    {
      id: 1,
      lives: 5,
      price: 3,
      popular: false,
      icon: Heart,
      color: "from-pink-500 to-rose-500",
      priceId: "price_1ReHAvCP0ZaVsNmiIvklaMr2", // Test mode price ID - needs to be updated to live mode
    },
    {
      id: 2,
      lives: 10,
      price: 5,
      popular: true,
      icon: Zap,
      color: "from-purple-500 to-indigo-500",
      priceId: "price_1ReHCDCP0ZaVsNmiyzk4EMiX", // Test mode price ID - needs to be updated to live mode
    },
    {
      id: 3,
      lives: 20,
      price: 10,
      popular: false,
      icon: ShoppingCart,
      color: "from-green-500 to-emerald-500",
      priceId: "price_1ReHCvCP0ZaVsNmiaga0ejvk", // Test mode price ID - needs to be updated to live mode
    },
  ];

  const handlePurchase = async (priceId: string, lives: number) => {
    if (currentLevel >= 75) {
      alert(
        "Life purchases are disabled after level 75. Complete the game to unlock this feature again!"
      );
      return;
    }

    try {
      // Create checkout session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          lives,
          currentLevel,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout session:", error);

      // For development/testing: provide a fallback demo flow
      if (import.meta.env.DEV) {
        const demoMode = confirm(
          `API not available. Would you like to simulate a successful purchase of ${lives} lives?\n\n(This is only for development testing)`
        );

        if (demoMode) {
          // Simulate successful payment by redirecting with lives parameter
          window.location.href = `/?payment_success=true&lives=${lives}&session_id=demo_session_${Date.now()}`;
        }
      } else {
        alert(
          "Payment system temporarily unavailable. Please try again later."
        );
      }
    }
  };

  const isPurchaseDisabled = currentLevel >= 75;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Life Store
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Need more lives to continue your journey of self-discovery? Choose a
            package that suits your needs.
          </p>
          {isPurchaseDisabled && (
            <div className="mt-6 p-4 bg-red-900 border border-red-700 rounded-xl max-w-2xl mx-auto">
              <p className="text-red-200 font-semibold">
                ⚠️ Life purchases are disabled after level 75. You're in the
                final stretch - complete the game to unlock purchases again!
              </p>
            </div>
          )}
        </div>

        {/* Packages Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {packages.map((pkg) => {
            const IconComponent = pkg.icon;
            return (
              <div
                key={pkg.id}
                className={`relative bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700 transform hover:scale-105 transition-all duration-300 ${
                  pkg.popular ? "ring-2 ring-purple-500 mt-6" : ""
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <div
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${pkg.color} mb-6`}
                  >
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">
                    {pkg.lives} Lives
                  </h3>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">
                      ${pkg.price}
                    </span>
                    <span className="text-gray-400 ml-2">USD</span>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-center text-gray-300">
                      <Heart className="w-4 h-4 mr-2 text-red-400" />
                      <span>{pkg.lives} additional lives</span>
                    </div>
                    <div className="flex items-center justify-center text-gray-300">
                      <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                      <span>Instant activation</span>
                    </div>
                    <div className="flex items-center justify-center text-gray-300">
                      <span className="text-green-400 mr-2">✓</span>
                      <span>Continue current game</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase(pkg.priceId, pkg.lives)}
                    disabled={isPurchaseDisabled}
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 transform ${
                      isPurchaseDisabled
                        ? "bg-gray-600 cursor-not-allowed opacity-50"
                        : `hover:scale-105 bg-gradient-to-r ${pkg.color} hover:shadow-lg`
                    }`}
                  >
                    {isPurchaseDisabled
                      ? "Disabled (Level 75+)"
                      : "Purchase Now"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={onBack}
            className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            ← Back to Game
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl mx-auto border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">How it works</h3>
            <div className="text-gray-300 space-y-2">
              <p>• Secure payment processing through Stripe</p>
              <p>• Lives are added instantly after successful payment</p>
              <p>• Continue your current game progress</p>
              <p>• No subscription required - one-time purchase</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
