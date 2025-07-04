import React, {
  lazy,
  Suspense,
  createContext,
  useContext,
  useState,
} from "react";

// 懒加载各类浮层容器
const LazyModalContainer = lazy(() => import("./ModalContainer"));
const LazyDrawerContainer = lazy(() => import("./DrawerContainer"));

const OverlayContext = createContext<any>(null);
export const useOverlay = () => useContext(OverlayContext);

export const OverlayProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [modalAPI, setModalAPI] = useState<any>(null);
  const [drawerAPI, setDrawerAPI] = useState<any>(null);

  const value = {
    modal: modalAPI,
    drawer: drawerAPI,
  };

  return (
    <OverlayContext.Provider value={value}>
      <Suspense fallback={null}>
        <LazyModalContainer setAPI={setModalAPI} />
        <LazyDrawerContainer setAPI={setDrawerAPI} />
      </Suspense>
      {children}
    </OverlayContext.Provider>
  );
};
