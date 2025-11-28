export interface WalkSubscription {
  id: string;
  name: string;
  walksPerWeek: number;
  stripeProductIdEnvVar: string;
}

export interface WalkSubscriptionWithId extends WalkSubscription {
  stripeProductId: string;
}

export const WALK_SUBSCRIPTIONS: WalkSubscription[] = [
  {
    id: "2_walks_week",
    name: "2 Walks/Week",
    walksPerWeek: 2,
    stripeProductIdEnvVar: "STRIPE_PRODUCT_ID_2_WALKS_A_WEEK",
  },
  {
    id: "3_walks_week",
    name: "3 Walks/Week",
    walksPerWeek: 3,
    stripeProductIdEnvVar: "STRIPE_PRODUCT_ID_3_WALKS_A_WEEK",
  },
  {
    id: "5_walks_week",
    name: "5 Walks/Week",
    walksPerWeek: 5,
    stripeProductIdEnvVar: "STRIPE_PRODUCT_ID_5_WALKS_A_WEEK",
  },
];

export function resolveWalkSubscription(subscriptionId: string): WalkSubscriptionWithId | null {
  const definition = WALK_SUBSCRIPTIONS.find((sub) => sub.id === subscriptionId);
  if (!definition) {
    return null;
  }
  const stripeProductId = process.env[definition.stripeProductIdEnvVar];
  if (!stripeProductId) {
    throw new Error(
      `Missing Stripe product env var: ${definition.stripeProductIdEnvVar}`
    );
  }
  return { ...definition, stripeProductId };
}