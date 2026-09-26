import Sidebar from "./Sidebar";

export default function PageLayout({ bg, icon: Icon, title, subtitle, actions, children }) {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed text-white"
      style={{
        backgroundImage: `linear-gradient(rgba(4,10,32,0.82), rgba(4,10,32,0.82)), url(${bg})`,
      }}
    >
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="min-w-0 flex-1 p-5 md:p-8">
          <header className="flex flex-wrap items-start justify-between gap-4 border-b border-blue-500/20 pb-5">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-slate-200/80 text-slate-100">
                <Icon size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold leading-tight">{title}</h1>
                <p className="mt-1 text-slate-300">{subtitle}</p>
              </div>
            </div>
            {actions}
          </header>

          <div className="mt-5">{children}</div>
        </main>
      </div>
    </div>
  );
}