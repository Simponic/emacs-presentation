const gruvboxColors = [
  "#b8bb26",
  "#fabd2f",
  "#83a598",
  "#d3869b",
  "#8ec07c",
  "#458588",
  "#cc241d",
  "#d65d0e",
  "#bdae93",
];

export const generateGruvboxFromString = (string) => 
  gruvboxColors[Array.from(string).map((x) => x.charCodeAt(0)).reduce((a, x) => a+x, 0) % gruvboxColors.length];