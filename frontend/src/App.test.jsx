import { render, screen } from "@testing-library/react";
import App from "./App";
import axios from "axios";

vi.mock("axios");

test("renders backend message", async () => {
  axios.get.mockResolvedValueOnce({ data: { msg: "hello" } });

  render(<App />);

  expect(screen.getByText(/Backend says:/i)).toBeInTheDocument();
  expect(screen.getByText(/\.\.\./)).toBeInTheDocument();

  expect(await screen.findByText(/Backend says:\s*hello/i)).toBeInTheDocument();
});