import { useEffect, useRef, useState } from "react";
import { Button, Result } from "antd";
import type { ResultProps } from "antd";

export interface RetryPageProps {
  status?: ResultProps["status"];
  title: string;
  subTitle?: string;
  btnTxt?: string;
  retry: () => void;
  autoRetrySeconds?: number;
  allowAutoRetry?: boolean; // 是否允许自动重试
  remainingAttempts?: number; // 剩余自动重试次数
}

const RetryPage = ({
  status = "warning",
  title,
  subTitle,
  btnTxt,
  retry,
  autoRetrySeconds = 5,
  allowAutoRetry = true,
  remainingAttempts = 0,
}: RetryPageProps) => {
  const [seconds, setSeconds] = useState(autoRetrySeconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!allowAutoRetry || autoRetrySeconds <= 0) {
      setSeconds(0);
      return;
    }

    setSeconds(autoRetrySeconds);

    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          retry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [retry, allowAutoRetry, autoRetrySeconds]);
  return (
    <div className="h-full flex items-center justify-center bg-white rounded-lg">
      <Result
        status={status}
        title={title}
        subTitle={
          <div className="space-y-2">
            <p className="text-gray-600">{subTitle}</p>

            {allowAutoRetry && seconds > 0 ? (
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mt-4">
                <p className="text-blue-600 m-0">
                  System will automatically retry in{" "}
                  <span className="font-bold text-lg">{seconds}</span>{" "}
                  seconds...
                </p>
                <p className="text-blue-400 text-xs mt-1">
                  Remaining auto-retry attempts:{" "}
                  <span className="font-semibold">{remainingAttempts}</span>{" "}
                  times
                </p>
              </div>
            ) : (
              !allowAutoRetry && (
                <p className="text-red-400 text-sm mt-4 font-medium">
                  Maximum auto-retry attempts reached. Please check your network
                  and retry manually.
                </p>
              )
            )}
          </div>
        }
        extra={
          <Button type="primary" onClick={retry} size="large">
            {btnTxt || "Retry Now"}
          </Button>
        }
      />
    </div>
  );
};

export default RetryPage;
