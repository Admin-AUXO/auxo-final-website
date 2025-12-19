"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Link,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { navItems, type NavItem, type DropdownItem as NavDropdownItem } from "../../data/navigation";
import { createUrl } from "../../utils/url";

export default function HeroUINavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isOpen: isServicesOpen, onOpen: onServicesOpen, onClose: onServicesClose } = useDisclosure();
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Check initial theme
    const html = document.documentElement;
    const checkTheme = () => {
      const isDark = html.classList.contains("dark") || (!html.classList.contains("light") && window.matchMedia("(prefers-color-scheme: dark)").matches);
      setTheme(isDark ? "dark" : "light");
    };
    checkTheme();

    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(html, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Handle scroll
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      html.classList.add("light");
    } else {
      html.classList.remove("light");
      html.classList.add("dark");
    }
    // Trigger custom event for other theme toggles
    window.dispatchEvent(new CustomEvent("theme-toggle"));
  };

  const servicesItem = navItems.find((item) => item.name === "Services" && item.isModal);
  const otherItems = navItems.filter((item) => !item.isModal);
  const contactUrl = createUrl("contact");

  return (
    <>
      <Navbar
        onMenuOpenChange={setIsMenuOpen}
        isBordered
        className={`fixed top-0 z-[1000] transition-all duration-300 ${
          isScrolled ? "bg-background/95 backdrop-blur-xl shadow-lg border-divider" : "bg-background/80 backdrop-blur-md border-divider/50"
        }`}
        maxWidth="full"
        height="4.5rem"
        classNames={{
          wrapper: "px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto",
          base: "border-b",
        }}
      >
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden"
          />
          <NavbarBrand>
            <a href="/" className="flex items-center gap-2.5 sm:gap-3 group">
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 40 40"
                  fill="none"
                  className="h-10 w-10 sm:h-11 sm:w-11 lg:h-12 lg:w-12 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  aria-label="AUXO Data Labs Logo"
                >
                  <rect x="0" y="0" width="18" height="18" fill="hsl(var(--nextui-primary))" />
                  <text x="9" y="14" textAnchor="middle" fontFamily="var(--font-brand)" fontWeight="900" fontSize="13" fill="hsl(var(--nextui-foreground))">A</text>
                  <rect x="22" y="0" width="18" height="18" fill="hsl(var(--nextui-primary))" />
                  <text x="31" y="14" textAnchor="middle" fontFamily="var(--font-brand)" fontWeight="900" fontSize="13" fill="hsl(var(--nextui-foreground))">U</text>
                  <rect x="0" y="22" width="18" height="18" fill="hsl(var(--nextui-primary))" />
                  <text x="9" y="36" textAnchor="middle" fontFamily="var(--font-brand)" fontWeight="900" fontSize="13" fill="hsl(var(--nextui-foreground))">X</text>
                  <rect x="22" y="22" width="18" height="18" fill="hsl(var(--nextui-primary))" />
                  <text x="31" y="36" textAnchor="middle" fontFamily="var(--font-brand)" fontWeight="900" fontSize="13" fill="hsl(var(--nextui-foreground))">O</text>
                </svg>
              </div>
              <div className="hidden lg:flex flex-col items-start">
                <span className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight leading-tight">
                  Data Labs
                </span>
                <span className="text-primary text-xs sm:text-sm font-semibold italic leading-tight">
                  Look Beyond Data
                </span>
              </div>
            </a>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden lg:flex gap-2" justify="center">
          {servicesItem && (
            <NavbarItem>
              <Button
                onPress={onServicesOpen}
                variant="light"
                className="text-foreground hover:text-primary data-[hover=true]:bg-default/50 min-h-[44px] px-4"
              >
                {servicesItem.name}
              </Button>
            </NavbarItem>
          )}
          {otherItems.map((item) => (
            <NavbarItem key={item.href}>
              <Link
                color="foreground"
                href={item.href}
                className="hover:text-primary transition-colors min-h-[44px] px-4 flex items-center"
              >
                {item.name}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        <NavbarContent justify="end" className="gap-2">
          <NavbarItem>
            <Button
              id="theme-toggle-react"
              isIconOnly
              variant="light"
              className="text-foreground hover:text-primary min-w-[44px] min-h-[44px]"
              onPress={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </Button>
          </NavbarItem>
          <NavbarItem className="hidden lg:flex">
            <Button
              as={Link}
              color="primary"
              href={contactUrl}
              variant="bordered"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold min-h-[44px]"
            >
              Let's Talk
            </Button>
          </NavbarItem>
        </NavbarContent>

        <NavbarMenu className="pt-6 bg-background/98 backdrop-blur-xl">
          {servicesItem && (
            <NavbarMenuItem>
              <Button
                onPress={() => {
                  onServicesOpen();
                  setIsMenuOpen(false);
                }}
                variant="light"
                className="w-full justify-start text-foreground min-h-[52px]"
              >
                {servicesItem.name}
              </Button>
            </NavbarMenuItem>
          )}
          {otherItems.map((item) => (
            <NavbarMenuItem key={item.href}>
              <Link
                color="foreground"
                href={item.href}
                className="w-full min-h-[52px] flex items-center"
                size="lg"
                onPress={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            </NavbarMenuItem>
          ))}
          <NavbarMenuItem>
            <Button
              as={Link}
              color="primary"
              href={contactUrl}
              variant="solid"
              className="w-full font-semibold min-h-[56px]"
              onPress={() => setIsMenuOpen(false)}
            >
              Let's Talk
            </Button>
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>

      {/* Services Modal */}
      {servicesItem && servicesItem.dropdown && (
        <Modal
          isOpen={isServicesOpen}
          onClose={onServicesClose}
          size="full"
          scrollBehavior="inside"
          placement="top"
          classNames={{
            base: "bg-background",
            header: "border-b border-divider bg-background/98 backdrop-blur-xl",
            body: "py-6",
            footer: "border-t border-divider bg-background/98 backdrop-blur-xl",
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1 px-6 py-4">
                  <h2 className="text-2xl font-bold">{servicesItem.name}</h2>
                  <p className="text-sm text-default-500">Explore our comprehensive solutions</p>
                </ModalHeader>
                <ModalBody className="px-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(servicesItem.dropdown || []).map((service: NavDropdownItem, index) => (
                      <Link
                        key={service.href}
                        href={service.href}
                        className="group relative flex flex-col p-5 rounded-xl bg-default-100 hover:bg-default-200 border border-divider hover:border-primary transition-all duration-300 min-h-[200px]"
                        onPress={onClose}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-primary/30 transition-colors border border-primary/20">
                          <span className="text-primary text-2xl">📊</span>
                        </div>
                        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                          {service.name}
                        </h3>
                        {service.description && (
                          <p className="text-sm text-default-500 line-clamp-2 flex-1">
                            {service.description}
                          </p>
                        )}
                        <div className="mt-auto pt-2 flex items-center gap-2 text-primary text-sm font-semibold">
                          <span>Explore</span>
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                </ModalBody>
                <ModalFooter className="px-6">
                  <Button color="default" variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <Button
                    as={Link}
                    color="primary"
                    href={createUrl("services")}
                    onPress={onClose}
                  >
                    View All Services
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  );
}
