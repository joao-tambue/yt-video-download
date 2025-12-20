import type { ReactNode } from "react";

export type WhenProps = {
  expr: any | (() => boolean);
  children: ReactNode | ((...args: any[]) => ReactNode);
};

export type ElseProps = {
  children: ReactNode | ((...args: any[]) => ReactNode);
};