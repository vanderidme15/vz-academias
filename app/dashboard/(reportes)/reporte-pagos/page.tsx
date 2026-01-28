import PaymentsChart from "./payments-chart";

export default function ReportePagosPage() {
  return (
    <div className="flex flex-col gap-4 w-full h-full bg-muted/30 rounded-xl p-4">
      <h1 className="text-3xl font-bold">Reporte de pagos</h1>
      {/* <ChartBarInteractive /> */}
      <PaymentsChart />
    </div>
  )
}