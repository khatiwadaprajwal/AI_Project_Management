export function DashboardPage() {
  return (
    <>
      <h1 className="text-lg font-medium text-slate-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="rounded-md bg-surface-sunken p-4">
          <p className="text-sm text-ink-muted">Projects</p>
          <p className="text-xl font-medium text-slate-900 mt-0.5">—</p>
        </div>
        <div className="rounded-md bg-surface-sunken p-4">
          <p className="text-sm text-ink-muted">Tasks</p>
          <p className="text-xl font-medium text-slate-900 mt-0.5">—</p>
        </div>
        <div className="rounded-md bg-surface-sunken p-4">
          <p className="text-sm text-ink-muted">Members</p>
          <p className="text-xl font-medium text-slate-900 mt-0.5">—</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <h3 className="text-md font-medium text-slate-900 mb-2.5">My tasks</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase text-ink-muted">
                <th className="text-left font-medium py-2 pr-4">Task</th>
                <th className="text-left font-medium py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="py-2 pr-4 text-slate-700">No tasks assigned yet</td>
                <td className="py-2">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
