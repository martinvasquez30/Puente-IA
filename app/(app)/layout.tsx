import { AppShell } from '@/components/app/AppShell'

export default function LayoutApp({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
