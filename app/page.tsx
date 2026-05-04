import { getAllChars } from '@/lib/chars'
import { HomeClient } from './HomeClient'

export default async function HomePage() {
  const chars = await getAllChars()
  return <HomeClient chars={chars} />
}
