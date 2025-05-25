import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    role: "USER", // default role
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    address: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await response.json();

    if (response.ok) {
      setMessage(`✅ Berhasil daftar! User ID: ${data.id}`);
    } else {
      setMessage(`❌ Gagal: ${data.message || JSON.stringify(data)}`);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Register User</h1>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
          required
        /><br/><br/>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        /><br/><br/>

        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone Number"
          value={form.phoneNumber}
          onChange={handleChange}
          required
        /><br/><br/>

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        /><br/><br/>

        <input
          type="text"
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
        /><br/><br/>

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          required
        >
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select><br/><br/>

        <button type="submit">Register</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
