"use client";

/** Placeholder mark on the portrait. Swap this component for the real logo later. */
export function AvatarMark() {
  return (
    <div className="avatar-mark" aria-hidden>
      <div className="mark-scene">
        <div className="mark-gyro">
          <i className="mark-ring r1" />
          <i className="mark-ring r2" />
          <i className="mark-ring r3" />
          <i className="mark-core" />
        </div>
      </div>
    </div>
  );
}
