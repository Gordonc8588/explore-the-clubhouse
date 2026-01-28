/**
 * Survey Submit API Route
 * POST /api/survey/submit - Finalize and submit survey response
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for survey submission
const submitSurveySchema = z.object({
  session_id: z.string().uuid('Invalid session ID'),

  // Q1-2: About Children
  num_children: z.string().nullable().optional(),
  children_ages: z.array(z.string()).nullable().optional(),

  // Q3-4: Demand
  interest_level: z.string().nullable().optional(),
  holiday_periods: z.array(z.string()).nullable().optional(),

  // Q5-7: Days & Times
  preferred_days: z.string().nullable().optional(),
  specific_days: z.array(z.string()).nullable().optional(),
  preferred_times: z.array(z.string()).nullable().optional(),
  days_per_week: z.string().nullable().optional(),

  // Q8-9: Activities
  activities: z.array(z.string()).nullable().optional(),
  activities_notes: z.string().max(500).nullable().optional(),

  // Q10-11: Structure
  age_group_preference: z.string().nullable().optional(),
  structure_preference: z.string().nullable().optional(),

  // Q12-13 + Postcode: Practical
  important_factors: z.array(z.string()).max(3, 'Maximum 3 factors allowed').nullable().optional(),
  additional_services: z.array(z.string()).nullable().optional(),
  postcode: z.string().max(10).nullable().optional(),

  // Q14-16: Final
  other_feedback: z.string().max(1000).nullable().optional(),
  next_holiday_interest: z.string().nullable().optional(),
  contact_consent: z.boolean().default(false),
  email: z.string().email().nullable().optional(),
  gdpr_consent: z.boolean().default(false),
});

/**
 * POST /api/survey/submit
 * Finalize and submit survey response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = submitSurveySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const supabase = await createClient();

    // Validate email/GDPR consent logic
    if (data.contact_consent && data.email && !data.gdpr_consent) {
      return NextResponse.json(
        { error: 'GDPR consent is required when providing an email' },
        { status: 400 }
      );
    }

    // Mark session as completed
    const { error: sessionError } = await supabase
      .from('survey_sessions')
      .update({
        completed_at: new Date().toISOString(),
        current_step: 8, // Thank you page
        responses: data,
      })
      .eq('id', data.session_id);

    if (sessionError) {
      console.error('Error updating session:', sessionError);
      // Continue anyway - response is more important
    }

    // Create the survey response
    const { data: response, error } = await supabase
      .from('survey_responses')
      .insert({
        session_id: data.session_id,
        is_complete: true,
        num_children: data.num_children,
        children_ages: data.children_ages,
        interest_level: data.interest_level,
        holiday_periods: data.holiday_periods,
        preferred_days: data.preferred_days,
        specific_days: data.specific_days,
        preferred_times: data.preferred_times,
        days_per_week: data.days_per_week,
        activities: data.activities,
        activities_notes: data.activities_notes,
        age_group_preference: data.age_group_preference,
        structure_preference: data.structure_preference,
        important_factors: data.important_factors,
        additional_services: data.additional_services,
        postcode: data.postcode?.toUpperCase(),
        other_feedback: data.other_feedback,
        next_holiday_interest: data.next_holiday_interest,
        contact_consent: data.contact_consent,
        email: data.email,
        gdpr_consent: data.gdpr_consent,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating survey response:', error);
      return NextResponse.json(
        { error: 'Failed to submit survey response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      response_id: response.id,
      message: 'Thank you for completing the survey!',
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/survey/submit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
