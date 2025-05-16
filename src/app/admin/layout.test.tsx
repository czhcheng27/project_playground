import React from "react";
import { render, screen } from "@testing-library/react";
import AdminLayout from "./layout";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => "/",
}));

describe("AdminLayout", () => {
  it("renders children content", () => {
    render(
      <AdminLayout>
        <div>hello children</div>
      </AdminLayout>
    );
    expect(screen.getByText("hello children")).toBeInTheDocument();
  });
});
