import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("./contexts/AuthContext", () => ({
  AuthProvider: ({ children }) => <>{children}</>,
}));

vi.mock("./components/common", () => ({
  ProtectedRoute: ({ children }) => <>{children}</>,
  PublicRoute: ({ children }) => <>{children}</>,
  AdminRoute: ({ children }) => <>{children}</>,
  ErrorBoundary: ({ children }) => <>{children}</>,
}));

vi.mock("./pages", () => ({
  HomePage: () => <div>Home Page</div>,
  QuestionListPage: () => <div>Question List Page</div>,
  LoginPage: () => <div>Login Page</div>,
  RegisterPage: () => <div>Register Page</div>,
  ForgotPasswordPage: () => <div>Forgot Password Page</div>,
  DoQuestionPage: () => <div>Do Question Page</div>,
  PostQuestionPage: () => <div>Post Question Page</div>,
  UserProfilePage: () => <div>User Profile Page</div>,
  AdminDashboardPage: () => <div>Admin Dashboard Page</div>,
}));

vi.mock("./pages/LeaderboardPage", () => ({
  default: () => <div>Leaderboard Page</div>,
}));

import App from "./App";

describe("App routing shell", () => {
  it("renders the home route content", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });
});
