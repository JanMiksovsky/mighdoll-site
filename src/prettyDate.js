export default function prettyDate(date) {
  return date.toLocaleDateString("en-us", {
    year: "numeric",
    month: "long",
  });
}
