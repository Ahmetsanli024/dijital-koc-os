import LgsSimulatorWidget from '../components/LgsSimulatorWidget';
import PageHeader from '../components/PageHeader';

export default function LgsSimulatorPage() {
  return (
    <div>
      <PageHeader title="LGS Simülatörü" subtitle="Tahmini puan ve şehre göre lise kazanma ihtimalleri" breadcrumb={['Ana Sayfa', 'Yapay Zeka', 'LGS Simülatörü']} />
      <LgsSimulatorWidget />
    </div>
  );
}
