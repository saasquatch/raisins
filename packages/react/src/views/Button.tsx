import SlButton from "@shoelace-style/react/dist/button";
import React, { ComponentType } from "react";

export const Button: ComponentType<typeof SlButton> = (props) => {
  return <SlButton size="small" {...props} />;
};
