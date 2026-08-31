import { stats } from '@/data/properties';
export function Stats() { return <section className="stats"><div className="container stats-grid">{stats.map(stat => <div className="stat" key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div></section>; }
