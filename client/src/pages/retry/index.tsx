import { useEffect, useRef, useState } from "react";
import { Button, Result } from "antd";
import type { ResultProps } from "antd";

interface RetryPageProps {
  status?: ResultProps["status"];
  title: string;
  subTitle?: string;
  btnTxt?: string;
  retry: () => void;
  autoRetrySeconds?: number;
}

const RetryPage = ({
  status = "warning",
  title,
  subTitle,
  btnTxt,
  retry,
  autoRetrySeconds = 10,
}: RetryPageProps) => {
  const [seconds, setSeconds] = useState(autoRetrySeconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 清除定时器的函数
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleRetry = () => {
    clearTimer();
    retry();
  };

  useEffect(() => {
    // 启动倒计时
    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearTimer();
          retry(); // 倒计时到 0，触发重试
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 组件卸载时清除定时器，防止内存泄漏
    return () => clearTimer();
  }, [retry]);

  return (
    <div className="h-full flex items-center justify-center bg-white rounded-lg">
      <Result
        status={status}
        title={title}
        subTitle={
          <div>
            <p>{subTitle}</p>
            {seconds > 0 && (
              <p className="text-gray-400 text-sm mt-2">
                System will automatically retry in{" "}
                <span className="text-blue-500 font-bold">{seconds}</span>{" "}
                seconds...
              </p>
            )}
          </div>
        }
        extra={
          <Button type="primary" onClick={handleRetry} size="large">
            {btnTxt || "Retry Now"}
          </Button>
        }
      />
    </div>
  );
};

export default RetryPage;
