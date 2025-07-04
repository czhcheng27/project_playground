import React, { useState, useEffect } from "react";
import { Drawer } from "antd";

const DrawerContainer = ({ setAPI }: { setAPI: (api: any) => void }) => {
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState<React.ReactNode>(null);
  const [options, setOptions] = useState<{ title?: string; width?: number }>(
    {}
  );

  const open = (node: React.ReactNode, opts: any = {}) => {
    setContent(node);
    setOptions(opts);
    setVisible(true);
  };

  const close = () => {
    setVisible(false);
  };

  useEffect(() => {
    setAPI({ open, close });
  }, []);

  return (
    <Drawer
      open={visible}
      title={options.title}
      width={options.width || 500}
      onClose={close}
      destroyOnHidden
    >
      {content}
    </Drawer>
  );
};

export default DrawerContainer;
