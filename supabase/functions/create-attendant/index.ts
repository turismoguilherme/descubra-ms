import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, name, phone, cat_id, city_id, working_hours } = await req.json()

    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // First, check if the invoker is authorized (gestor_municipal, admin, tech)
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Check user role
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('role, city_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return new Response(JSON.stringify({ error: 'User profile not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    const allowedRoles = ['gestor_municipal', 'admin', 'tech']
    if (!allowedRoles.includes(userProfile.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden: Only managers and admins can create attendants' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    // Generate temporary password
    const tempPassword = 'TempPass' + Math.floor(Math.random() * 10000).toString().padStart(4, '0')

    // Now, create the new user with the service_role key.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: false,
      user_metadata: { full_name: name },
    })

    if (createError) {
      throw createError
    }

    if (!newUser || !newUser.user) {
      throw new Error("User creation failed, no user returned.")
    }

    // Create user profile
    const { error: profileInsertError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: newUser.user.id,
        email,
        full_name: name,
        phone: phone || null,
        role: 'atendente',
        status: 'active',
        city_id: city_id || userProfile.city_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (profileInsertError) {
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      throw profileInsertError
    }

    // Create user_metadata with must_change_password = true
    const { error: metadataError } = await supabaseAdmin
      .from('user_metadata')
      .insert({
        user_id: newUser.user.id,
        must_change_password: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (metadataError) {
      console.error('Error creating user_metadata:', metadataError)
      // Don't fail if metadata creation fails, but log it
    }

    // Associate attendant with CAT location if cat_id is provided
    if (cat_id) {
      const { error: assignmentError } = await supabaseAdmin
        .from('attendant_location_assignments')
        .insert({
          attendant_id: newUser.user.id,
          location_id: cat_id,
          assigned_at: new Date().toISOString(),
          assigned_by: user.id,
          is_active: true,
        })

      if (assignmentError) {
        console.error('Error assigning attendant to location:', assignmentError)
        // Don't fail if assignment fails, but log it
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      user: newUser.user,
      temp_password: tempPassword,
      message: 'Atendente criado com sucesso'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

