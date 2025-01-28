import { DeliveryDashboard } from '@/components/dasboard/DeliveryDashboard'

export default function Home({ params }: { params: { id_p: string } }) {
	return <DeliveryDashboard id_p={params.id_p} />
}
