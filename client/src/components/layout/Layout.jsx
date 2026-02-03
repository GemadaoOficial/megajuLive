import { Outlet } from 'react-router-dom'
import Header from './Header'

export default function Layout() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 px-6 pb-8 max-w-7xl mx-auto relative z-10">
        <Outlet />
      </main>
    </div>
  )
}
