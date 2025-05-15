import DrawerList from "./components/DrawerList";
import styles from "./page.module.scss";

export default function DashboardPage() {
  return (
    <div className={styles.modulebox}>
      {/* top banner */}
      <div className={styles.topBanner}>
        <div className={styles.bannerTitle}>
          Welcome to Cheng&apos;'s project
        </div>
      </div>

      {/* DrawerList */}
      <div className={styles.drawerListArea}>
        <DrawerList />
      </div>
    </div>
  );
}
