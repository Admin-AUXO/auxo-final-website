import { HeroUIProvider as BaseHeroUIProvider } from "@heroui/react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function HeroUIProvider({ children }: Props) {
  return (
    <BaseHeroUIProvider>
      {children}
    </BaseHeroUIProvider>
  );
}
