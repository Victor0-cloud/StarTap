import type { Coordinates } from "@/types/game";

const EARTH_RADIUS_KM = 6371.0088;

export function isValidCoordinates(point: Coordinates): boolean {
  return Number.isFinite(point.latitude) && Number.isFinite(point.longitude) &&
    Math.abs(point.latitude) <= 90 && Math.abs(point.longitude) <= 180;
}

export function calculateDistanceKm(pointA: Coordinates, pointB: Coordinates): number {
  if (!isValidCoordinates(pointA) || !isValidCoordinates(pointB)) {
    throw new RangeError("Invalid geographic coordinates");
  }
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const latitudeDelta = radians(pointB.latitude - pointA.latitude);
  const longitudeDelta = radians(pointB.longitude - pointA.longitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(pointA.latitude)) * Math.cos(radians(pointB.latitude)) *
    Math.sin(longitudeDelta / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(Math.min(1, haversine)));
}
