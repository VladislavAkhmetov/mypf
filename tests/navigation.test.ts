import { describe, it, expect } from "vitest";
import {
  parseNavigationParams,
  buildNavigationQuery,
  ALL_PROJECT_SLUGS,
  PORTFOLIO_DIRECTIONS,
} from "@/lib/xp/navigation";

describe("parseNavigationParams", () => {
  it("defaults to profile when no parameters are present", () => {
    const result = parseNavigationParams("");
    expect(result.target).toBe("profile");
    expect(result.projectSlug).toBeUndefined();
    expect(result.projectNotFound).toBeUndefined();
    expect(result.otherParams).toEqual({});
  });

  it("handles ?view=profile correctly", () => {
    const result = parseNavigationParams("?view=profile");
    expect(result.target).toBe("profile");
    expect(result.otherParams).toEqual({});
  });

  it("handles ?view=portfolio correctly", () => {
    const result = parseNavigationParams("?view=portfolio");
    expect(result.target).toBe("portfolio");
    expect(result.focus).toBeUndefined();
    expect(result.projectSlug).toBeUndefined();
  });

  it("handles ?view=portfolio&focus=communication correctly", () => {
    const result = parseNavigationParams("?view=portfolio&focus=communication");
    expect(result.target).toBe("portfolio");
    expect(result.focus).toBe("communication");
    expect(result.projectSlug).toBeUndefined();
  });

  it("handles ?view=portfolio&focus=engineering correctly", () => {
    const result = parseNavigationParams("?view=portfolio&focus=engineering");
    expect(result.target).toBe("portfolio");
    expect(result.focus).toBe("engineering");
    expect(result.projectSlug).toBeUndefined();
  });

  it("handles ?project=kora correctly", () => {
    const result = parseNavigationParams("?project=kora");
    expect(result.target).toBe("portfolio");
    expect(result.projectSlug).toBe("kora");
    expect(result.projectNotFound).toBeUndefined();
  });

  it("prioritizes known project over view parameter", () => {
    const result = parseNavigationParams("?project=kora&view=profile");
    expect(result.target).toBe("portfolio");
    expect(result.projectSlug).toBe("kora");
  });

  it("preserves focus with project", () => {
    const result = parseNavigationParams("?project=kora&focus=communication");
    expect(result.target).toBe("portfolio");
    expect(result.projectSlug).toBe("kora");
    expect(result.focus).toBe("communication");
  });

  it("handles unknown project by returning projectNotFound: true and target: portfolio", () => {
    const result = parseNavigationParams("?project=nonexistent_project");
    expect(result.target).toBe("portfolio");
    expect(result.projectNotFound).toBe(true);
    expect(result.projectSlug).toBeUndefined();
  });

  it("handles unknown focus by defaulting to general portfolio catalog", () => {
    const result = parseNavigationParams("?view=portfolio&focus=unknown_focus");
    expect(result.target).toBe("portfolio");
    expect(result.focus).toBeUndefined();
  });

  it("handles unknown view by defaulting to profile", () => {
    const result = parseNavigationParams("?view=something_random");
    expect(result.target).toBe("profile");
  });

  it("preserves extraneous query parameters", () => {
    const result = parseNavigationParams("?project=kora&source=mail&ref=xyz");
    expect(result.target).toBe("portfolio");
    expect(result.projectSlug).toBe("kora");
    expect(result.otherParams).toEqual({
      source: "mail",
      ref: "xyz",
    });
  });

  it("preserves extraneous parameters on clean entry", () => {
    const result = parseNavigationParams("?utm_source=tg");
    expect(result.target).toBe("profile");
    expect(result.otherParams).toEqual({ utm_source: "tg" });
  });
});

describe("buildNavigationQuery", () => {
  it("round-trips tool deep links with focus and unrelated parameters", () => {
    const query = buildNavigationQuery("portfolio", { toolSlug: "auto-bezier-kern", focus: "engineering", otherParams: { source: "test" } });
    expect(parseNavigationParams(query)).toEqual({ target: "portfolio", toolSlug: "auto-bezier-kern", focus: "engineering", otherParams: { source: "test" } });
  });

  it("routes unknown tools to the catalog and prioritizes a project", () => {
    expect(parseNavigationParams("?tool=missing").projectNotFound).toBe(true);
    expect(parseNavigationParams("?tool=auto-bezier-kern&project=kora").projectSlug).toBe("kora");
  });
  it("builds query for profile with no extra params", () => {
    expect(buildNavigationQuery("profile")).toBe("");
  });

  it("builds query for profile with extra params", () => {
    expect(
      buildNavigationQuery("profile", {
        otherParams: { utm_source: "test" },
      })
    ).toBe("?utm_source=test&view=profile");
  });

  it("builds query for portfolio catalog without focus", () => {
    expect(buildNavigationQuery("portfolio")).toBe("?view=portfolio");
  });

  it("builds query for portfolio catalog with focus", () => {
    expect(
      buildNavigationQuery("portfolio", { focus: "communication" })
    ).toBe("?view=portfolio&focus=communication");
  });

  it("builds query for project", () => {
    expect(
      buildNavigationQuery("portfolio", { projectSlug: "kora" })
    ).toBe("?project=kora");
  });

  it("builds query for project with preserved focus and extra params", () => {
    expect(
      buildNavigationQuery("portfolio", {
        projectSlug: "kora",
        focus: "communication",
        otherParams: { tag: "arch" },
      })
    ).toBe("?tag=arch&project=kora&focus=communication");
  });
});

describe("Direction slugs coverage", () => {
  it("covers all projects, allowing a project in both directions", () => {
    const allPartitioned = [
      ...PORTFOLIO_DIRECTIONS.communication.slugs,
      ...PORTFOLIO_DIRECTIONS.engineering.slugs,
    ];
    expect(new Set(allPartitioned).size).toBe(ALL_PROJECT_SLUGS.length);
    ALL_PROJECT_SLUGS.forEach((slug) => {
      expect(allPartitioned).toContain(slug);
    });
  });
});
