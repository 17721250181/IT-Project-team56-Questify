import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

export default function App() {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    axios.get(`${API}/questions/hello/`).then(r => setMsg(r.data.msg));
  }, []);
  return <h1>Backend says: {msg || "..."}</h1>;
}