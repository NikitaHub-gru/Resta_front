import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const body = await request.json()
    
    const supabase = createRouteHandlerClient({ 
      cookies,
    }, {
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    })

    // Обновляем данные пользователя
    const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        email: body.email,
        user_metadata: {
          full_name: body.name,
          name: body.name,
          role: body.role,
          corporation: body.corporations[0]
        },
        app_metadata: {
          role: body.role
        }
      }
    )

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        message: 'User updated successfully', 
        user: authData.user 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// Опционально: получение данных пользователя
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    
    const supabase = createRouteHandlerClient({ 
      cookies,
    }, {
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    })

    const { data, error } = await supabase.auth.admin.getUserById(userId)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(data, { status: 200 })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
