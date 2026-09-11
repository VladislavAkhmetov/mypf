"use client";

import { AvatarMark } from "@/components/avatar-mark";
import { ClientOnly } from "@/components/client-only";
import { Superellipse } from "@/components/superellipse";
import { site } from "@/data/site";
import { useLocale } from "../lib/i18n";
import dynamic from "next/dynamic";
import Image from "next/image";

const BorderBeam = dynamic(() => import("border-beam").then((m) => m.BorderBeam), {
  ssr: false,
});

function AvatarFace() {
  return (
    <Superellipse n="avatar" className="avatar">
      <Image
        src={site.avatar}
        alt={site.name}
        fill
        sizes="(max-width: 960px) min(70vw, 18rem), 18rem"
        className="object-cover"
        priority
      />
      <div className="avatar-fade" />
    </Superellipse>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="contact-ico">
      <path
        fill="currentColor"
        d="M21.5 4.3 18.2 20c-.24 1.06-1.57 1.48-2.5.8l-4.18-3.06-2.02 1.95c-.22.22-.55.3-.85.2l.32-4.02 7.3-6.6c.32-.29-.07-.43-.5-.17l-9.02 5.68-3.88-1.21c-.84-.26-.85-1.18.15-1.52L20.2 3.4c.8-.3 1.54.2 1.3.9Z"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="contact-ico">
      <path
        fill="currentColor"
        d="M3.2 5.5A2.2 2.2 0 0 1 5.4 3.4h13.2A2.2 2.2 0 0 1 20.8 5.5v13a2.2 2.2 0 0 1-2.2 2.1H5.4A2.2 2.2 0 0 1 3.2 18.5v-13Zm2.3.9 6.5 4.3 6.5-4.3H5.5Zm13.1 1.66-6.18 4.08a1.4 1.4 0 0 1-1.54 0L4.7 8.06V18.4h13.9V8.06Z"
      />
    </svg>
  );
}

export function Profile() {
  const { t } = useLocale();

  return (
    <div className="profile">
      <div className="avatar-stage">
        <ClientOnly fallback={<div className="avatar-beam">{<AvatarFace />}</div>}>
          <BorderBeam
            size="pulse-outside"
            colorVariant="sunset"
            theme="dark"
            strength={0.62}
            duration={3.4}
            className="avatar-beam"
          >
            <AvatarFace />
          </BorderBeam>
        </ClientOnly>
        <AvatarMark />
      </div>
      <div className="profile-copy">
        <h1>{site.name}</h1>
        <p className="profile-role">{t(site.role)}</p>
        <p className="profile-job">{t(site.workplace)}</p>
        <p className="profile-note">{t(site.note)}</p>
        <ul className="profile-tags">
          {site.stack.map((tag) => (
            <li key={tag.en}>{t(tag)}</li>
          ))}
        </ul>
        <div className="contact-row">
          <a
            href={site.telegram}
            target="_blank"
            rel="noreferrer"
            className="contact-btn"
          >
            <span className="contact-inner">
              <TelegramIcon />
              {t(site.contact.telegram)}
            </span>
          </a>
          <a href={`mailto:${site.email}`} className="contact-btn">
            <span className="contact-inner">
              <MailIcon />
              {t(site.contact.email)}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
