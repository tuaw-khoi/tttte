import React from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import Button from "../ui/Button";

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, title }) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="lg:hidden"
        >
          <Bars3Icon className="h-5 w-5" />
        </Button>

        {/* Title */}
        <div className="flex-1 px-4">
          <h1 className="text-xl font-semibold">
            {title || "Bảng điều khiển"}
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
