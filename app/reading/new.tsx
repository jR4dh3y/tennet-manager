import { useLocalSearchParams } from 'expo-router';
import ReadingForm from '../../src/components/ReadingForm';

export default function NewReadingScreen() {
  const { tenantId } = useLocalSearchParams<{ tenantId?: string }>();
  return <ReadingForm tenantId={tenantId} />;
}
