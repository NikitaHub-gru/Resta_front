import { NextResponse } from 'next/server'
import { Server } from 'socket.io'

let io: Server

// Initialize WebSocket server
if (process.env.NODE_ENV !== 'production') {
	if (!(global as any).io) {
		console.log('Initializing Socket.IO server...')
		;(global as any).io = new Server({
			cors: {
				origin: '*',
				methods: ['GET', 'POST']
			}
		})
		io = (global as any).io
		io.listen(3001)
		console.log('Socket.IO server initialized on port 3001')
	}
	io = (global as any).io
}

// Mock data storage (in a real app, this would be a database)
const getOrdersData = () => {
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

	return [
		{
			name: 'Малахова',
			slots: timeSlots.map(time => ({
				time,
				orders: time === '11-12' || time === '16-17' ? 4 : 0
			}))
		},
		{
			name: 'Соц',
			slots: timeSlots.map(time => ({
				time,
				orders: time === '11-12' || time === '16-17' ? 4 : 0
			}))
		},
		{
			name: 'Поляна',
			slots: timeSlots.map(time => ({
				time,
				orders: time === '11-12' || time === '16-17' ? 4 : 0
			}))
		}
	]
}

// Store our data in memory for this example
let locationsData = getOrdersData()

export async function POST(request: Request) {
	try {
		const body = await request.json()
		console.log('Received order request:', body)

		// Update our in-memory data
		locationsData = locationsData.map(loc => {
			if (loc.name === body.location) {
				return {
					...loc,
					slots: loc.slots.map(slot => {
						if (slot.time === body.timeSlot) {
							return { ...slot, orders: slot.orders + 1 }
						}
						return slot
					})
				}
			}
			return loc
		})

		console.log('Emitting orderUpdated event...')

		// Emit the update to all connected clients
		if (io) {
			io.emit('orderUpdated', {
				location: body.location,
				timeSlot: body.timeSlot,
				updatedLocations: locationsData
			})
		} else {
			console.error('Socket.IO server not initialized')
		}

		return NextResponse.json(
			{
				success: true,
				message: 'Order created successfully',
				data: body,
				locations: locationsData
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
	return NextResponse.json({
		success: true,
		locations: locationsData
	})
}
