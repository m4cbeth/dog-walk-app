export interface WalkPackDefinition {
  id: string;
  name: string;
  tokens: number;
  priceCents: number;
  stripePriceEnvVar: string;
}

export interface WalkPack extends WalkPackDefinition {
  stripePriceId: string;
}

export const WALK_PACKS: WalkPackDefinition[] = [
  {
    id: "pack_5",
    name: "5 Walk Pack",
    tokens: 5,
    priceCents: 9000,
    stripePriceEnvVar: "STRIPE_PRICE_PACK_5",
  },
  {
    id: "pack_10",
    name: "10 Walk Pack",
    tokens: 10,
    priceCents: 15000,
    stripePriceEnvVar: "STRIPE_PRICE_PACK_10",
  },
];

export function resolveWalkPack(packId: string): WalkPack | null {
  const definition = WALK_PACKS.find((pack) => pack.id === packId);
  if (!definition) {
    return null;
  }
  const stripePriceId = process.env[definition.stripePriceEnvVar];
  if (!stripePriceId) {
    throw new Error(
      `Missing Stripe price env var: ${definition.stripePriceEnvVar}`
    );
  }
  return { ...definition, stripePriceId };
}

