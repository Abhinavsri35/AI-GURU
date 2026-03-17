import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen mesh-bg flex flex-col md:flex-row">
      <Navbar />
      <main className="flex-1 md:ml-64 w-full h-full min-h-screen relative">
        {children}
      </main>
    </div>
  )
}
