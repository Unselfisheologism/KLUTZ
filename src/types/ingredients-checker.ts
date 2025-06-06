export interface IngredientsAnalysisInput {
  type: 'image' | 'text';
  imageData?: string;
  textData?: string;
  manufacturer?: string;
}

export interface Ingredient {
  name: string;
  description: string;
  safety_rating: 'Safe' | 'Caution' | 'Warning' | 'Unknown';
  common_uses: string[];
  potential_concerns: string[];
  alternatives?: string[];
  source?: 'visible' | 'typical_recipe' | 'likely_additive' | 'provided' | 'unknown';
}

export interface IngredientsAnalysisReport {
  product_name?: string;
  manufacturer?: string;
  analysis_type?: 'ingredients_label' | 'food_item' | 'raw_ingredients' | 'text_input' | 'unknown';
  ingredients_list: Ingredient[];
  overall_assessment: {
    safety_rating: 'Safe' | 'Moderate Concern' | 'High Concern' | 'Insufficient Data';
    summary: string;
    key_concerns: string[];
    recommendations: string[];
  };
  dietary_flags?: {
    vegan: boolean;
    vegetarian: boolean;
    gluten_free: boolean;
    common_allergens: string[];
  };
  confidence: 'High' | 'Medium' | 'Low' | 'Not Applicable';
  disclaimer: string;
}

export interface IngredientsCheckerFormValues {
  inputType: 'image' | 'text';
  imageFile?: FileList;
  textInput?: string;
  manufacturer?: string;
}