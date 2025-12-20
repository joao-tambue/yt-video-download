import React from "react";
import type { ItemBase, ListProps } from "./type";

export const List = <T extends ItemBase>({ items, children }: ListProps<T>) => {
  return (
    <React.Fragment>
      {items.map((item, index) => children({ item, index }))}
    </React.Fragment>
  );
};
