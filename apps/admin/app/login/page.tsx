export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
      }}
    >
      <form
        style={{
          width: "100%",
          maxWidth: 360,
          background: "#fff",
          padding: "32px 28px",
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          display: "grid",
          gap: 16,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22 }}>talantly admin</h1>
        <p style={{ margin: 0, color: "#666", fontSize: 14 }}>
          Tizimga kirish uchun ma&apos;lumotlaringizni kiriting.
        </p>
        <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
          Email
          <input
            type="email"
            name="email"
            required
            style={{
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: 8,
              fontSize: 14,
            }}
          />
        </label>
        <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
          Parol
          <input
            type="password"
            name="password"
            required
            style={{
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: 8,
              fontSize: 14,
            }}
          />
        </label>
        <button
          type="submit"
          style={{
            padding: "10px 12px",
            background: "#111",
            color: "#fff",
            border: 0,
            borderRadius: 8,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Kirish
        </button>
      </form>
    </main>
  );
}
