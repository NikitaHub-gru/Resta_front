import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

import { supabase } from '@/lib/supabaseClient'

// Organization ID to location name mapping
const org_locations: Record<string, string> = {
	'0372747c-0a0e-4c21-8f08-a150e94ad809': 'Поляна',
	'34758b3b-1961-4306-96be-66bc316cd782': 'Малахова',
	'd9892380-abaa-4eee-9fd9-013841cb7662': 'Соц'
}

export async function POST(request: Request) {
	try {
		const body = await request.json()
		console.log('Received order request:', body)

		// Find org_id for the selected location
		const orgId = Object.keys(org_locations).find(
			key => org_locations[key] === body.location
		)

		if (!orgId) {
			return NextResponse.json(
				{
					success: false,
					message: 'Invalid location'
				},
				{ status: 400 }
			)
		}

		// Handle order clearing (when an order is closed)
		if (body.action === 'clear') {
			// Find and delete an order with matching criteria
			const { data: orderToDelete, error: findError } = await supabase
				.from('DymmiYamii')
				.select('id')
				.eq('org_id', orgId)
				.eq('time_print', body.timeSlot)
				.limit(1)

			if (findError) {
				throw findError
			}

			if (orderToDelete && orderToDelete.length > 0) {
				const { error: deleteError } = await supabase
					.from('DymmiYamii')
					.delete()
					.eq('id', orderToDelete[0].id)

				if (deleteError) {
					throw deleteError
				}
			}

			return NextResponse.json(
				{
					success: true,
					message: 'Order cleared successfully'
				},
				{ status: 200 }
			)
		}

		// Regular order creation
		const { data, error } = await supabase.from('DymmiYamii').insert([
			{
				org_id: orgId,
				time_print: body.timeSlot // Make sure this is in the expected format (e.g., "13-14")
			}
		])

		if (error) {
			throw error
		}

		return NextResponse.json(
			{
				success: true,
				message: 'Order created successfully',
				data: data
			},
			{ status: 201 }
		)
	} catch (error) {
		console.error('Error processing order:', error)
		return NextResponse.json(
			{
				success: false,
				message: 'Failed to create order'
			},
			{ status: 400 }
		)
	}
}

export async function GET() {
  try {
    console.log('GET request received for orders')
    const { data, error } = await supabase.from('DymmiYamii').select('*')

    if (error) {
      console.error('Supabase query error:', error)
      throw error
    }

    // Log the exact structure of the first few records
    if (Array.isArray(data) && data.length > 0) {
      console.log('Sample record structure:', JSON.stringify(data[0], null, 2))
      console.log('All org_ids in data:', data.map(item => item.org_id))
      console.log('All time_print values:', data.map(item => item.time_print))
    }

    // Process the data to match our locations structure
    const timeSlots = [
      '11-12',
      '12-13',
      '13-14',
      '14-15',
      '15-16',
      '16-17',
      '17-18',
      '18-19',
      '19-20',
      '20-21',
      '21-22',
      '22-23'
    ]

    // Initialize location data structure
    const locationsData = Object.values(org_locations).map(locationName => ({
      name: locationName,
      slots: timeSlots.map(time => ({
        time,
        orders: 0
      }))
    }))

    // Group orders by org_id and time_print
    const orderCounts: Record<string, number> = {}

    // Make sure data is an array before iterating
    if (Array.isArray(data)) {
      console.log('Processing', data.length, 'orders')
      data.forEach(order => {
        // Check if order has the required properties
        if (order && order.org_id && order.time_print) {
          // Extract hour from time_print if it's in time format (HH:MM:SS)
          let hour: number | null = null
          
          if (typeof order.time_print === 'string' && order.time_print.includes(':')) {
            // Handle time format like "13:10:00"
            hour = parseInt(order.time_print.split(':')[0])
          } else if (typeof order.time_print === 'string' && order.time_print.includes('-')) {
            // Handle time slot format like "13-14"
            hour = parseInt(order.time_print.split('-')[0])
          }
          
          if (hour !== null && hour >= 11 && hour <= 22) {
            const timeSlot = `${hour}-${hour + 1}`
            const key = `${order.org_id}|${timeSlot}`
            
            if (!orderCounts[key]) {
              orderCounts[key] = 0
            }
            orderCounts[key]++
          } else {
            console.log(`Skipping order with invalid hour: ${order.time_print}`)
          }
        } else {
          console.log('Skipping order with missing properties:', order)
        }
      })
    }

    console.log('Order counts:', orderCounts)

    // Update location data with order counts
    Object.entries(orderCounts).forEach(([key, count]) => {
      const [orgId, timeSlot] = key.split('|')
      
      const locationName = org_locations[orgId]
      console.log(`Processing: orgId=${orgId}, locationName=${locationName}, timeSlot=${timeSlot}, count=${count}`)

      if (locationName && timeSlot) {
        const locationIndex = locationsData.findIndex(
          loc => loc.name === locationName
        )
        if (locationIndex !== -1) {
          const slotIndex = locationsData[locationIndex].slots.findIndex(
            slot => slot.time === timeSlot
          )
          if (slotIndex !== -1) {
            locationsData[locationIndex].slots[slotIndex].orders = count
            console.log(`Updated: ${locationName}, slot ${timeSlot}, count ${count}`)
          } else {
            console.log(`Time slot ${timeSlot} not found in predefined slots`)
          }
        } else {
          console.log(`Location ${locationName} not found in locationsData`)
        }
      } else {
        console.log(`Could not map: locationName=${locationName}, timeSlot=${timeSlot}`)
      }
    })
    
    console.log('Final processed locations data:', locationsData)

    return NextResponse.json({
      success: true,
      locations: locationsData
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch orders'
      },
      { status: 500 }
    )
  }
}
