"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useGarage } from "../context/garageContext";


const navigationItems = [
  {label: "Обзор", href: "/", icon: "⌂"},
  {label: "История", href: "/history", icon: "◫"},
  {label: "Топливо", href: "/fuel", icon: "⛽"},
  {label: "Аналитика", href: "/analytics", icon: "◔"},
  {label: "Задачи", href: "/tasks", icon: "✓"}   
];


const Icon = (props) => <span className="menu-icon" aria-hidden="true">{props.children}</span>;


export default function AppShell({ children }) {

  const currentPath = usePathname();
  const { resetData } = useGarage();
  const [darkMode, setDarkMode] = useState(false);


  useEffect(() => {
    const savedTheme = localStorage.getItem("autoscope-theme");
    const isDark = savedTheme === "dark";
    setDarkMode(isDark);
    document.documentElement.dataset.theme = isDark ? "dark" : "light";

  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("autoscope-theme", next ? "dark" : "light");
  };

  const handleReset = () => {
    if (window.confirm("Очистить все данные? Автомобиль, история, топливо и задачи будут удалены.")) {
      resetData();
    }};

  return (

    <div className="layout">
      <aside className="menu">
        <Link href="/" className="brand">
          <span className="logo">
            <img src="/logo.svg" alt="" />
          </span>
          <span><b>Auto</b>Scope</span>
        </Link>

        <nav className="menu-nav">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`menu-link ${currentPath === item.href ? "active" : ""}`}
            >
              <Icon>{item.icon}</Icon>
              {item.label}
            </Link>
          ))}
        </nav>


        <div className="menu-footer">

          <button className="btn-theme" onClick={toggleTheme}>
            <span>{darkMode ? "☀" : "☾"}</span>
            {darkMode ? "Дневная тема" : "Ночная тема"}
          </button>

          <button className="btn-reset" onClick={handleReset}>
            ↻ <span>Очистить данные</span>
          </button>
        </div>
         
      </aside>

      <main className="content">{children} </main>
    </div>
  );
}


