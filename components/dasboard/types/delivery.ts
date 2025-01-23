export interface DeliveryOrder {
	id: string
	timestamp: Date
	totalTime: number
	prepTime: number
	shelfTime: number
	transitTime: number
	status: 'onTime' | 'delayed'
}
