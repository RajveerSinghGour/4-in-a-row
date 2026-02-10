export default function Cell({ value, onClick }) {
  let color = "white";
  if (value === 1) color = "red";
  if (value === 2) color = "yellow";

  return (
    <div
      onClick={onClick}
      style={{
        width: 50,
        height: 50,
        border: "1px solid black",
        backgroundColor: color,
        cursor: "pointer",
      }}
    />
  );
}
