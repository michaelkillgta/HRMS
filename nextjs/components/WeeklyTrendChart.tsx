'use client';

interface DayStat {
  date: string;
  dayLabel: string;
  total: number;
  present: number;
  late: number;
  leave: number;
  rate: number;
}

interface WeeklyTrendChartProps {
  stats?: DayStat[];
  data?: DayStat[];
}

export default function WeeklyTrendChart({ stats, data }: WeeklyTrendChartProps) {
  const chartStats = stats || data || [];
  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <div className="card-header-left">
          <h2 className="card-title">7-Day Attendance Trend</h2>
          <span className="card-subtitle">Daily present rate across active workforce</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#2563eb' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#2563eb' }} /> On-Time
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f59e0b' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#f59e0b' }} /> Late
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ef4444' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#ef4444' }} /> Leave
          </span>
        </div>
      </div>

      <div className="card-body">
        <div className="chart-container">
          {chartStats.map((day) => {
            const barHeight = Math.max(12, Math.min(100, day.rate));
            const isToday = day.dayLabel === 'Today';

            return (
              <div key={day.date} className="chart-bar-group" title={`${day.date}: ${day.present} Present, ${day.late} Late, ${day.leave} Leave (${day.rate}%)`}>
                <span className="chart-bar-val">{day.rate}%</span>
                <div className="chart-bar-track">
                  <div
                    className={`chart-bar-fill ${day.late > 2 ? 'warning' : ''}`}
                    style={{ height: `${barHeight}%` }}
                  />
                </div>
                <span className="chart-bar-label" style={{ fontWeight: isToday ? 700 : 500, color: isToday ? '#2563eb' : '#64748b' }}>
                  {day.dayLabel}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.78rem', color: '#64748b' }}>
          <span>Avg Attendance: <strong>89.2%</strong></span>
          <span>Target Standard: <strong>95.0%</strong></span>
        </div>
      </div>
    </div>
  );
}
