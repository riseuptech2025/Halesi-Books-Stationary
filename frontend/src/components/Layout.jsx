import Sidebar from "./Sidebar";

export default function Layout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
        </header>
        {children}
      </main>
    </div>
  );
}