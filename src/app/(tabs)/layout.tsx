import AppGate from "@/components/AppGate";
import BottomNav from "@/components/BottomNav";
import TabBoundary from "@/components/TabBoundary";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppGate>
      <div className="app-frame pb-2">
        <TabBoundary>{children}</TabBoundary>
      </div>
      <BottomNav />
    </AppGate>
  );
}
