import { useLocalSearchParams } from 'expo-router';
import NotFound from '../../src/components/NotFound';
import ReadingForm from '../../src/components/ReadingForm';
import { useRetained } from '../../src/lib/useRetained';
import { useData } from '../../src/DataContext';

export default function EditReadingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const reading = useRetained(useData().data.readings.find(r => r.id === id));
  return reading ? <ReadingForm reading={reading} /> : <NotFound what="Reading" />;
}
