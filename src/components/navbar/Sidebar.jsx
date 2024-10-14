"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Home, Menu, Upload, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from "next/link";

const SidebarItem = ({ icon: Icon, label, collapsed, href="#" }) => (
  <Link href="#">
    <Button variant="ghost" className={`w-full justify-start ${collapsed ? 'px-2' : ''}`} onClick={() => window.location.href = href} asChild>
      <span className="flex items-center">
        <Icon className={`h-5 w-5 ${collapsed ? '' : 'mr-2'}`} />
        {!collapsed && <span>{label}</span>}
      </span>
    </Button>
  </Link>
);

const Sidebar = ({ defaultCollapsed = false }) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [isMobile, setIsMobile] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const sidebarRef = useRef(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsHidden(mobile);
      setCollapsed(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isMobile && !isHidden && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsHidden(true);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isMobile, isHidden]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsHidden(!isHidden);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      setIsHidden(true);
    } else if (isRightSwipe) {
      setIsHidden(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && isHidden && (
        <Button
          variant="ghost"
          className="fixed top-20 left-4 z-50 p-2 md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}
     
      <div
        ref={sidebarRef}
        className={`bg-gray-800 text-white h-[calc(100vh-4rem)] fixed top-16 left-0 transition-all duration-300
          ${isMobile ? (isHidden ? '-translate-x-full' : 'translate-x-0 w-64') : (collapsed ? 'w-16' : 'w-64')}
          ${isMobile ? 'z-40 shadow-lg' : 'relative'}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <ScrollArea className="h-full">
          <div className={`p-4 space-y-4 ${collapsed && !isMobile ? 'items-center' : ''}`}>
            <SidebarItem icon={Home} label="Home" collapsed={collapsed && !isMobile} href='/' />
            <SidebarItem icon={User} label="Profile" collapsed={collapsed && !isMobile} href='/profile' />
            <SidebarItem icon={Upload} label="Upload" collapsed={collapsed && !isMobile} href="/upload" />
           
            {(!collapsed || isMobile) && <hr className="my-4 border-gray-700" />}
           
            {(!collapsed || isMobile) && (
              <></>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

export default Sidebar;