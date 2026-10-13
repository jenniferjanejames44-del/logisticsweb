import { describe, it, expect, vi, afterEach } from "vitest";
import { getCountries, getStates, loadCities } from "./locationData";
import usCities from "../../public/geo/cities/US.json";

afterEach(() => vi.restoreAllMocks());

describe("location data", () => {
  it("lists countries and states without the full world city list", () => {
    expect(getCountries().some((c) => c.name === "United States" && c.isoCode === "US")).toBe(true);
    expect(getStates("United States").some((s) => s.name === "Texas")).toBe(true);
  });

  it("returns Nigeria's 36 states plus FCT and its LGAs", async () => {
    expect(getStates("Nigeria")).toHaveLength(37);
    expect(await loadCities("Nigeria", "Lagos")).toContain("Ikeja");
  });

  it("downloads cities for one country only when a state is chosen", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(usCities), { status: 200 }),
    );
    const cities = await loadCities("United States", "Texas");
    expect(fetchMock).toHaveBeenCalledWith("/geo/cities/US.json");
    expect(cities).toContain("Houston");
  });

  it("never throws when the city download fails, so people can still type a city", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Load failed"));
    await expect(loadCities("Canada", "Ontario")).resolves.toEqual([]);
  });
});
