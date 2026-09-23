export type HardwareCategory =
  | 'ALL'
  | 'AIRFRAME'
  | 'PROPULSION'
  | 'FLIGHT CONTROL'
  | 'NAVIGATION'
  | 'SENSORS'
  | 'AI / COMPUTING'
  | 'COMMUNICATION'
  | 'POWER'
  | 'CONTROL & SAFETY';

export interface IntegrationFlow {
  source: string;
  target: string;
  label?: string;
  type: 'power' | 'data' | 'signal' | 'rf';
}

export interface HardwareComponent {
  id: string;
  slug: string;
  number: number;
  name: string;
  category: HardwareCategory;
  quantity: number | string;
  role: string;
  approxPrice: string;
  pricePerUnitText: string;
  priceType: 'ESTIMATED PRICE' | 'APPROX. PRICE' | 'EST. PRICE';
  status: 'TARGET COMPONENT' | 'REPRESENTATIVE COMPONENT';
  manufacturerTarget?: string;
  summary: string;
  whatIsIt: string;
  whyUsed: string;
  howIntegrated: string;
  keyDesignConcept?: string;
  specifications: {
    label: string;
    value: string;
    highlight?: boolean;
  }[];
  integrationFlow: {
    nodes: string[];
    description: string;
    flowType: 'propulsion' | 'ai_sensing' | 'navigation' | 'communication' | 'power_avionics' | 'control_safety';
  };
  sihApproachReference: string;
  dimensions?: string;
  weightGrams?: number | string;
  operatingVoltage?: string;
  powerConsumption?: string;
  interfaceBus?: string;
  aircraftLocation: 'Nose Turret' | 'Avionics Bay' | 'Wings & Booms' | 'Central Fuselage' | 'Tail Boom' | 'Ground Station';
}
