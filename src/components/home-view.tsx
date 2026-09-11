"use client";

import { Ambient } from "@/components/ambient";
import { LangSwitch } from "@/components/lang-switch";
import { Profile } from "@/components/profile";
import { ProjectGrid } from "@/components/project-grid";
import { SiteFooter } from "@/components/site-footer";
import { Stories } from "@/components/stories";

export function HomeView() {
  return (
    <>
      <Ambient />
      <div className="home-page">
        <div className="home-shell">
          <div className="home-toolbar">
            <LangSwitch />
          </div>
          <aside className="home-profile">
            <Profile />
            <Stories />
          </aside>
          <div className="home-work">
            <ProjectGrid />
          </div>
          <SiteFooter />
        </div>
      </div>
    </>
  );
}
