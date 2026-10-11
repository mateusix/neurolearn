import PaletteProvider from './palette-provider';
import ComfortProvider from "./comfort-provider";
import FamilyProvider from "./family-provider";
import { Header } from "./header";

type Props = {
  children: React.ReactNode;
};

const MarketingLayout = ({ children }: Props) => {
  return (
    <FamilyProvider><PaletteProvider><ComfortProvider><div className="min-h-screen flex flex-col bg-[var(--nl-bg)]">
      <Header />
      <main className="flex-1 flex flex-col items-center">
        {children}
      </main>
    </div></ComfortProvider></PaletteProvider></FamilyProvider>
  );
};

export default MarketingLayout;
