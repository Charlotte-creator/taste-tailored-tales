import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { preferences } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing user preferences:', preferences);

    // Build the analysis prompt
    const prompt = `You are a food recommendation AI analyzing a user's preferences. Generate a detailed, personalized thinking process based on their profile:

User Profile:
- Dietary restrictions: ${preferences.allergies?.length > 0 ? preferences.allergies.join(', ') : 'None'}
- Taste preference: ${preferences.cuisineSummary || 'Diverse palate'}
- Context: ${preferences.diningContext || 'Casual dining'}
- Priority: ${preferences.priority || 'Balanced experience'}
- Budget: $${preferences.budget || '50'}
- Max travel time: ${preferences.travelTime || '30'} minutes
- Vegan/Vegetarian: ${preferences.vegan ? 'Yes' : 'No'}

Generate a warm, personalized analysis (2-3 paragraphs) explaining:
1. What you understand about their taste preferences
2. How their constraints (budget, time, dietary needs) shape recommendations
3. What type of dining experiences would match their current mood/context

Write in a friendly, conversational tone as if you're a food expert advisor. Be specific and thoughtful.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are a thoughtful food recommendation expert who understands nuanced preferences and provides personalized insights.' 
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service requires payment. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('Failed to analyze preferences');
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    console.log('Analysis generated successfully');

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-preferences:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
