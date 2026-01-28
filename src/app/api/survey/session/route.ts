/**
 * Survey Session API Routes
 * POST /api/survey/session - Create a new survey session
 * PATCH /api/survey/session - Update session progress (auto-save)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Schema for creating a session
const createSessionSchema = z.object({
  user_agent: z.string().optional(),
});

// Schema for updating a session
const updateSessionSchema = z.object({
  session_id: z.string().uuid('Invalid session ID'),
  current_step: z.number().int().min(1).max(8),
  responses: z.record(z.string(), z.unknown()),
  completed: z.boolean().optional(),
});

/**
 * POST /api/survey/session
 * Create a new survey session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const validationResult = createSessionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    // Get IP address from headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip_address = forwardedFor ? forwardedFor.split(',')[0].trim() : null;
    const user_agent = validationResult.data.user_agent || request.headers.get('user-agent');

    const supabase = createAdminClient();

    const { data: session, error } = await supabase
      .from('survey_sessions')
      .insert({
        current_step: 1,
        responses: {},
        ip_address,
        user_agent,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating survey session:', error);
      return NextResponse.json(
        { error: 'Failed to create survey session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/survey/session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/survey/session
 * Update session progress (auto-save)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = updateSessionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { session_id, current_step, responses, completed } = validationResult.data;

    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = {
      current_step,
      responses,
    };

    if (completed) {
      updateData.completed_at = new Date().toISOString();
    }

    const { data: session, error } = await supabase
      .from('survey_sessions')
      .update(updateData)
      .eq('id', session_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating survey session:', error);
      return NextResponse.json(
        { error: 'Failed to update survey session' },
        { status: 500 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error in PATCH /api/survey/session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
