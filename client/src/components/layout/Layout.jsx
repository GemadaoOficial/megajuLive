import { Outlet } from 'react-router-dom'
import Header from './Header'

export default function Layout() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 px-5 md:px-8 lg:px-12 pb-8 relative z-10">
        <Outlet />
      </main>
    </div>
  )
}
