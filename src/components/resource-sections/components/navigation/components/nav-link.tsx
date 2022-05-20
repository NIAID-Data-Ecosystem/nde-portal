import React from "react";
import { Link, Text } from "nde-design-system";

interface NavLinkProps {
  href: string;
  isSelected: boolean;
  onClick: () => void;
}

export const NavLink: React.FC<NavLinkProps> = ({ isSelected, ...props }) => {
  return (
    <Link
      variant="ghost"
      borderLeft="2px solid"
      borderLeftColor={isSelected ? "accent.bg" : "transparent"}
      pl={3}
      _visited={{
        color: "link.color",
        borderLeftColor: isSelected ? "accent.bg" : "transparent",
      }}
      textDecoration={isSelected ? "underline" : "none"}
      _hover={{
        textDecoration: "underline!important",
        borderBottom: "none!important",
        "*": { borderBottom: "none!important" },
      }}
      {...props}
    >
      <Text fontSize="sm" color={isSelected ? "primary.400" : "text.heading"}>
        {props.children}
      </Text>
    </Link>
  );
};
