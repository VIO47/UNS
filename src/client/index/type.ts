interface Option {
    id: number; 
    title: string;
    description?: string;
    area?: number;
    embodied_carbon?: number;
    daylight_score?: number;
    cost_estimate?: number;
    program_fit?: string;
    notes?: string;
}

export type { Option };