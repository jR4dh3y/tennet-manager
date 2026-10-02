import { useLocalSearchParams } from 'expo-router';
import NotFound from '../../../src/components/NotFound';
import TenantForm from '../../../src/components/TenantForm';
import { useRetained } from '../../../src/lib/useRetained';
import { useData } from '../../../src/DataContext';

export default function EditTenantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tenant = useRetained(useData().data.tenants.find(t => t.id === id));
  return tenant ? <TenantForm tenant={tenant} /> : <NotFound what="Tenant" />;
}
