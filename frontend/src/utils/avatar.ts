export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0].toUpperCase())
    .join("")
    .slice(0, 2); // Limit to 2 letters
}
