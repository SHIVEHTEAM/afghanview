import { useState, useEffect } from "react";
import { useAuth } from "./auth";
import {
  getUserFeatures,
  getUserSubscription,
  getRemainingCredits,
  PremiumFeatures,
  SubscriptionPlan,
} from "./premium-features";

export function usePremiumFeatures() {
  const { user } = useAuth();
  const [features, setFeatures] = useState<PremiumFeatures | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setFeatures(null);
      setSubscription(null);
      setCredits(0);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [userFeatures, userSubscription, remainingCredits] =
          await Promise.all([
            getUserFeatures(user.id),
            getUserSubscription(user.id),
            getRemainingCredits(user.id),
          ]);

        setFeatures(userFeatures);
        setSubscription(userSubscription);
        setCredits(remainingCredits);
      } catch (err) {
        console.error("Error fetching premium features:", err);
        setError("Failed to load subscription information");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const hasFeature = (feature: keyof PremiumFeatures): boolean => {
    const value = features?.[feature];
    return typeof value === "boolean" ? value : false;
  };

  const canUseAI = (): boolean => {
    return hasFeature("aiContentGeneration") && credits > 0;
  };

  const getPlanName = (): string => {
    return subscription?.plan?.name || "Starter";
  };

  const getPlanSlug = (): string => {
    return subscription?.plan?.slug || "starter";
  };

  const isUnlimited = (): boolean => {
    return getPlanSlug() === "unlimited";
  };

  const isProfessional = (): boolean => {
    return getPlanSlug() === "professional";
  };

  const isStarter = (): boolean => {
    return getPlanSlug() === "starter";
  };

  return {
    features,
    subscription,
    credits,
    loading,
    error,
    hasFeature,
    canUseAI,
    getPlanName,
    getPlanSlug,
    isUnlimited,
    isProfessional,
    isStarter,
  };
}
