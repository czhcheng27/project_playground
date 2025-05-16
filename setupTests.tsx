import "@testing-library/jest-dom";
import React from "react";

//  静音 next/image 报错
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // 支持简单 img 标签替代，避免 loader 报错
    return <img {...props} alt={props.alt || "mocked-image"} />;
  },
}));

//  静音 next/navigation 报错
jest.mock("next/navigation", () => ({
  usePathname: jest.fn().mockReturnValue("/"),
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

//  可选：mock next/head，避免报错
jest.mock("next/head", () => {
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

//  静音 Antd 的 message、notification、modal（可选）
jest.mock("antd", () => {
  const antd = jest.requireActual("antd");
  return {
    ...antd,
    message: {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warning: jest.fn(),
    },
    notification: { open: jest.fn() },
    Modal: {
      confirm: jest.fn(),
      info: jest.fn(),
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
    },
  };
});

//  自动静音 act warning（适用于 rc-menu 等内部状态变更，防止污染控制台）
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: An update to") &&
      args[0].includes("was not wrapped in act")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});
afterAll(() => {
  console.error = originalError;
});
