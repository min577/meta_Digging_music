import AppGate from "@/components/AppGate";
import BottomNav from "@/components/BottomNav";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppGate>
      <div className="app-frame pb-28">{children}</div>
      <BottomNav />
    </AppGate>
  );
}
