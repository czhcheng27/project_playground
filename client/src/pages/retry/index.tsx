import { Button, Result } from "antd";
import type { ResultProps } from "antd";

interface RetryPageProps {
  status?: ResultProps["status"];
  title: string;
  subTitle?: string;
  btnTxt?: string;
  retry: () => void;
}

const RetryPage = ({
  status = "warning",
  title,
  subTitle,
  btnTxt,
  retry,
}: RetryPageProps) => {
  return (
    <div className="h-full flex items-center justify-center bg-white rounded-lg">
      <Result
        status={status}
        title={title}
        subTitle={subTitle}
        extra={
          <Button type="primary" onClick={() => retry()}>
            {btnTxt || "Retry"}
          </Button>
        }
      />
    </div>
  );
};

export default RetryPage;
